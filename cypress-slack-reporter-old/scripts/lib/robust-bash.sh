#!/bin/bash -eu
set -eu # Have to set explicitly as github's windows runners don't respect the `eu` in the shebang

if [ -z "${LIB_ROBUST_BASH_SH:-}" ]; then
  LIB_ROBUST_BASH_SH=included
  
  function error {
    echo "❌  ${1:-}"
  }

  function log {
    echo "🔵  ${1:-}"
  }

  function debug_log {
    if [ ! -z "${LIB_ROBUST_BASH_DEBUG:-}" ]; then
      echo "🔎  ${1:-}"
    fi
  }

  function warn {
    echo "🟡  ${1:-}"
  }

  # Check to see that we have a required binary on the path
  # and fail the script if it is not present
  function require_binary {
    if [ -z "${1:-}" ]; then
      error "${FUNCNAME[0]} requires an argument"
      exit 1
    fi

    if ! [ -x "$(command -v "$1")" ]; then
      error "The required executable '$1' is not on the path."
      exit 1
    fi
  }

  # Check to see that we have a required environment variable set,
  # and fail the script if it is not set.
  #
  # Optionally, a second argument can be provided to display 
  # a helpful message before failing
  function require_env_var {
    var_name="${1:-}"
    if [ -z "${!var_name:-}" ]; then
      error "The required environment variable ${var_name} is empty"
      if [ ! -z "${2:-}" ]; then
        echo "  - $2"
      fi
      exit 1
    fi
  }
fi