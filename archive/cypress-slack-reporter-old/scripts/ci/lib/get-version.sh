#!/bin/bash -eu
set -eu # Have to set explicitly as github's windows runners don't respect the `eu` in the shebang

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../../lib/robust-bash.sh

require_binary grep

VERSION="$(jq -r .version package.json)"
echo "$VERSION"