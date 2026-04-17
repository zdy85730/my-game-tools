#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  BACKEND_PATH
  GAME
  TOOL
  SERVICE_SLUG
  DEFAULT_PORT
  DEPLOY_HOST
  DEPLOY_PORT
  DEPLOY_USER
  DEPLOY_BASE_PATH
  DEPLOY_SSH_KEY_PATH
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

ssh_opts=(
  -i "${DEPLOY_SSH_KEY_PATH}"
  -p "${DEPLOY_PORT}"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
)
scp_opts=(
  -i "${DEPLOY_SSH_KEY_PATH}"
  -P "${DEPLOY_PORT}"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
)

deploy_target="${DEPLOY_USER}@${DEPLOY_HOST}"
target_dir="${DEPLOY_BASE_PATH}/${GAME}/${TOOL}/backend"
run_id="${GITHUB_RUN_ID:-manual}"
run_attempt="${GITHUB_RUN_ATTEMPT:-0}"
local_tmp="$(mktemp -d)"
staging_dir="${local_tmp}/staging"
archive_path="${local_tmp}/backend.tar.gz"
remote_tmp="/tmp/${SERVICE_SLUG}-deploy-${run_id}-${run_attempt}"

cleanup() {
  rm -rf "${local_tmp}"
  ssh "${ssh_opts[@]}" "${deploy_target}" "rm -rf '${remote_tmp}'" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Preparing backend deployment archive for ${BACKEND_PATH}..."
mkdir -p "${staging_dir}/${BACKEND_PATH}"
cp package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json "${staging_dir}/"
rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  "${BACKEND_PATH}/" "${staging_dir}/${BACKEND_PATH}/"

tar -C "${staging_dir}" -czf "${archive_path}" .

echo "Creating remote staging directory..."
ssh "${ssh_opts[@]}" "${deploy_target}" "mkdir -p '${remote_tmp}'"

echo "Uploading backend deployment archive..."
scp "${scp_opts[@]}" "${archive_path}" "${deploy_target}:${remote_tmp}/release.tar.gz"

deploy_remote_script=$(cat <<'REMOTE'
set -euo pipefail

target_dir="$1"
backend_path="$2"
service_slug="$3"
default_port="$4"
remote_tmp="$5"

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required on the deployment server." >&2
  exit 1
fi

staging_dir="${remote_tmp}/staging"
backend_env="${target_dir}/${backend_path}/.env.production"
backend_env_example="${target_dir}/${backend_path}/.env.production.example"
legacy_env="${target_dir}/.env.production"
compose_file="${target_dir}/${backend_path}/deploy/compose.yaml"

mkdir -p "${staging_dir}" "${target_dir}"
tar -xzf "${remote_tmp}/release.tar.gz" -C "${staging_dir}"

rsync -a --delete \
  --no-owner \
  --no-group \
  --no-perms \
  --omit-dir-times \
  --exclude='.env.production' \
  --exclude='node_modules' \
  --exclude='dist' \
  "${staging_dir}/" "${target_dir}/"

mkdir -p "$(dirname "${backend_env}")"
if [[ ! -f "${backend_env}" ]]; then
  if [[ -f "${legacy_env}" ]]; then
    cp "${legacy_env}" "${backend_env}"
    rm -f "${legacy_env}"
  elif [[ -f "${backend_env_example}" ]]; then
    cp "${backend_env_example}" "${backend_env}"
  else
    echo "Missing environment file for ${backend_path}" >&2
    exit 1
  fi
fi

cd "${target_dir}"
docker compose -f "${compose_file}" up -d --build --force-recreate

port="${default_port}"
if [[ -f "${backend_env}" ]]; then
  env_port="$(awk -F= '/^PORT=/{print $2; exit}' "${backend_env}" || true)"
  if [[ -n "${env_port}" ]]; then
    port="${env_port}"
  fi
fi

health_url="http://127.0.0.1:${port}/healthz"
health_ok=0
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error "${health_url}" >/dev/null; then
    health_ok=1
    break
  fi
  sleep 5
done

if [[ "${health_ok}" -ne 1 ]]; then
  echo "Health check failed: ${health_url}" >&2
  docker compose -f "${compose_file}" ps >&2 || true
  docker logs "${service_slug}" --tail 200 >&2 || true
  exit 1
fi
REMOTE
)

echo "Deploying on remote server..."
ssh "${ssh_opts[@]}" "${deploy_target}" \
  "bash -s -- '${target_dir}' '${BACKEND_PATH}' '${SERVICE_SLUG}' '${DEFAULT_PORT}' '${remote_tmp}'" \
  <<< "${deploy_remote_script}"

echo "Deployment completed successfully."
