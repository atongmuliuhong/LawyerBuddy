; Included inside the install section, after the upstream extraction macro.
!macro LawyerBuddyConfirmUpgrade
  ; Like Harness's directory-based upgrade, installation in the registered
  ; location replaces files directly. Moving is the only uninstall decision.
  StrCpy $LawyerBuddyReplaceMode "overwrite"
  ReadRegStr $R2 SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${If} $installMode == "all"
  ${AndIf} $R2 == ""
    ReadRegStr $R2 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${EndIf}
  ReadRegStr $R0 SHELL_CONTEXT "${UNINSTALL_REGISTRY_KEY}" UninstallString
  ${If} $R0 == ""
    ReadRegStr $R0 SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${EndIf}
  ${If} $installMode == "all"
  ${AndIf} $R0 == ""
    ReadRegStr $R0 HKCU "${UNINSTALL_REGISTRY_KEY}" UninstallString
  ${EndIf}
  ; A directory containing the executable is an in-place install even when an
  ; older installer did not register its location.
  ${If} $R2 == ""
  ${AndIf} $R0 == ""
  ${AndIf} ${FileExists} "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
    StrCpy $R2 "$INSTDIR"
  ${EndIf}
  ; Never overwrite a registered installation into another directory. The
  ; updater cannot choose a new location; manual installation can move only
  ; after the user explicitly chooses to uninstall the previous version.
  ${If} ${isUpdated}
  ${AndIf} $R2 != $INSTDIR
    DetailPrint "Update destination differs from the installed location: $R2"
    MessageBox MB_OK|MB_ICONSTOP "The update destination does not match the current installation. The existing version was kept. Please run the installer manually." /SD IDOK
    SetErrorLevel 1
    Quit
  ${EndIf}
  ${If} $R0 != ""
  ${OrIf} ${FileExists} "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
    ; Only the explicit updater flag permits unattended replacement. A plain
    ; silent installer must leave the previous installation untouched.
    ${IfNot} ${isUpdated}
      ${If} ${Silent}
        SetErrorLevel 1223
        Quit
      ${EndIf}
      ${If} $R2 != $INSTDIR
        StrCpy $R1 "The selected directory differs from the existing installation ($R2). To install here, uninstall the old version first. Continue?"
        ${If} $R2 == ""
          StrCpy $R1 "The existing installation directory could not be verified. To continue, uninstall the old version first. Continue?"
        ${EndIf}
        ${If} $LANGUAGE == 2052
        ${OrIf} $LANGUAGE == 1028
          StrCpy $R1 "所选目录与旧版安装目录（$R2）不同。要安装到此处，必须先卸载旧版。是否继续？"
          ${If} $R2 == ""
            StrCpy $R1 "无法确认旧版安装目录。要继续，必须先卸载旧版。是否继续？"
          ${EndIf}
        ${EndIf}
        MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "$R1" /SD IDNO IDYES lawyerbuddy_uninstall_first
        SetErrorLevel 1223
        Quit
        lawyerbuddy_uninstall_first:
          StrCpy $LawyerBuddyReplaceMode "uninstall"
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend

!macro LawyerBuddyDiscard
  nsExec::ExecToLog '"$PLUGINSDIR\install-payload.exe" --discard "$LawyerBuddyState"'
  Pop $R9
!macroend

!macro LawyerBuddyCheckUninstall
  ${If} ${Errors}
  ${OrIf} $R0 != 0
    !insertmacro LawyerBuddyDiscard
    MessageBox MB_OK|MB_ICONEXCLAMATION "Unable to remove the previous version. Installation stopped; see details below." /SD IDOK
    SetErrorLevel 2
    Quit
  ${EndIf}
!macroend

!macroundef extractUsing7za
!macro extractUsing7za ARCHIVE
  File /oname=$PLUGINSDIR\install-payload.exe "${PROJECT_DIR}\resources\.installer-tools\install-payload.exe"
  File /oname=$PLUGINSDIR\7za.exe "${PROJECT_DIR}\resources\.installer-tools\7za.exe"
  File /oname=$PLUGINSDIR\7zip-LICENSE.txt "${PROJECT_DIR}\resources\.installer-tools\LICENSE.txt"
  File /oname=$PLUGINSDIR\7zip-COPYING.txt "${PROJECT_DIR}\resources\.installer-tools\COPYING"
  StrCpy $R8 "en"
  ${If} $LANGUAGE == 2052
  ${OrIf} $LANGUAGE == 1028
    StrCpy $R8 "zh"
  ${EndIf}
  lawyerbuddy_extract_retry:
    SetDetailsPrint both
    nsExec::ExecToLog '"$PLUGINSDIR\install-payload.exe" "$PLUGINSDIR\7za.exe" "${ARCHIVE}" "$INSTDIR" "$HWNDPARENT" "$R8" "$LawyerBuddyState"'
    Pop $R9
    ; A cancellation confirmation can stay open after extraction finishes.
    ; Wait for that answer before crossing into the non-cancellable phase.
    ${DoWhile} $LawyerBuddyPhase == "confirm-cancel"
      Sleep 50
    ${Loop}
    ${If} $R9 == 1223
    ${OrIf} ${FileExists} "$LawyerBuddyState.cancel"
      !insertmacro LawyerBuddyDiscard
      SetErrorLevel 1223
      Quit
    ${EndIf}
    ${If} $R9 != 0
      SetDetailsView show
      StrCpy $R7 "Extraction failed. Check free disk space and see the details below before retrying."
      ${If} $R8 == "zh"
        StrCpy $R7 "解压未完成。请检查磁盘空间，并查看下方详情后重试。"
      ${EndIf}
      MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$R7" /SD IDCANCEL IDRETRY lawyerbuddy_extract_retry
      SetErrorLevel 1
      Quit
    ${EndIf}

  ; The long extraction phase is cancellable. Protect uninstall/commit from
  ; interruption so filesystem, uninstaller and registry stay consistent.
  StrCpy $LawyerBuddyPhase "commit"
  GetDlgItem $0 $HWNDPARENT 2
  EnableWindow $0 0
  DetailPrint "Files ready. Replacing installation and updating registration..."
  !insertmacro LawyerBuddyReplaceOldVersion
  ; The upstream uninstaller uses R8; restore the language before committing.
  StrCpy $R8 "en"
  ${If} $LANGUAGE == 2052
  ${OrIf} $LANGUAGE == 1028
    StrCpy $R8 "zh"
  ${EndIf}
  nsExec::ExecToLog '"$PLUGINSDIR\install-payload.exe" --commit "$LawyerBuddyState" "$HWNDPARENT" "$R8"'
  Pop $R9
  ${If} $R9 != 0
    SetDetailsView show
    MessageBox MB_OK|MB_ICONEXCLAMATION "Unable to complete installation. See details below and run the installer again." /SD IDOK
    SetErrorLevel 1
    Quit
  ${EndIf}
!macroend
