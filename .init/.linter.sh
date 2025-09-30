#!/bin/bash
cd /home/kavia/workspace/code-generation/company-data-qa-platform-2984-2994/qanda_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

