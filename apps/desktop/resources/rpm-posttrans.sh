#!/bin/sh
# Releases with electron-builder's default postun remove the new launcher on
# upgrade. Repair it after all old-package scriptlets have finished as well.
if [ -x '/opt/LawyerBuddy/lawyerbuddy-desktop' ]; then
  if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --install '/usr/bin/lawyerbuddy-desktop' 'lawyerbuddy-desktop' '/opt/LawyerBuddy/lawyerbuddy-desktop' 100
  else
    ln -sf '/opt/LawyerBuddy/lawyerbuddy-desktop' '/usr/bin/lawyerbuddy-desktop'
  fi
fi
