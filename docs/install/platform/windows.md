---
sidebar_position: 2
---

import SetupWizard from './_setup-wizard.mdx';
import NextSteps from './_next-steps.mdx';

# Windows

The Windows distribution of Stalwart is a single executable that runs as a Windows service. The instructions below use [NSSM](http://nssm.cc/download) to wrap the binary as a service so that it starts automatically at boot and so that its output can be captured in a log file. Administrator access on the target machine and outgoing HTTPS connectivity are required for the steps below.

## Download the binary

Open a browser on the Windows host and download the latest `stalwart-x86_64-pc-windows-msvc.zip` archive from the [releases page](https://github.com/stalwartlabs/stalwart/releases/latest). Extract the archive to reveal `stalwart.exe`.

## Create the installation directories

Open an elevated PowerShell window (right-click **Windows PowerShell** and choose **Run as administrator**) and create the directory layout that Stalwart expects:

```powershell
PS> mkdir "C:\Program Files\Stalwart\bin"
PS> mkdir "C:\Program Files\Stalwart\etc"
PS> mkdir "C:\Program Files\Stalwart\data"
PS> mkdir "C:\Program Files\Stalwart\logs"
```

Move `stalwart.exe` into the `bin` directory (adjust the source path if the archive was extracted somewhere other than `Downloads`):

```powershell
PS> Move-Item "$env:USERPROFILE\Downloads\stalwart.exe" "C:\Program Files\Stalwart\bin\stalwart.exe"
```

## Install the service with NSSM

Download [NSSM](http://nssm.cc/download), extract the archive, and copy `nssm.exe` (from the `win64` subdirectory) to a convenient location such as `C:\Program Files\Stalwart\bin\`. In the elevated PowerShell window run:

```powershell
PS> & "C:\Program Files\Stalwart\bin\nssm.exe" install Stalwart
```

The NSSM graphical installer appears. Configure the following tabs:

### Application tab

| Field | Value |
| --- | --- |
| Path | `C:\Program Files\Stalwart\bin\stalwart.exe` |
| Startup directory | `C:\Program Files\Stalwart` |
| Arguments | `--config "C:\Program Files\Stalwart\etc\config.json"` |

### I/O tab

Stalwart writes its bootstrap administrator credentials to standard error at first startup. To make those credentials retrievable, configure NSSM to redirect the streams to files:

| Field | Value |
| --- | --- |
| Output (stdout) | `C:\Program Files\Stalwart\logs\stdout.log` |
| Error (stderr) | `C:\Program Files\Stalwart\logs\stderr.log` |

### Details tab

Set **Display name** to `Stalwart Mail Server`, add a short description, and leave **Startup type** as `Automatic`.

Click **Install service** to close the dialog, then start the service from PowerShell:

```powershell
PS> Start-Service Stalwart
```

## Retrieve the bootstrap administrator credentials

After the service starts for the first time, Stalwart runs in **bootstrap mode**. A temporary administrator account is generated with a random password and the credentials are written to the redirected stderr stream. Bootstrap mode is a transient phase intended only to reach the setup wizard, after which a permanent administrator account is provisioned.

Open the stderr log that NSSM was configured to write:

```powershell
PS> Get-Content "C:\Program Files\Stalwart\logs\stderr.log"
```

The block to look for looks like this:

```
════════════════════════════════════════════════════════════
🔑 Stalwart bootstrap mode - temporary administrator account

   username: admin
   password: XXXXXXXXXXXXXXXX

Use these credentials to complete the initial setup at the
/admin web UI. Once setup is done, Stalwart will provision a
permanent administrator and this temporary account will no
longer apply.
════════════════════════════════════════════════════════════
```

Copy the 16-character password from the `password:` line. This is the only time the value appears in the logs.

To avoid relying on a log-extracted temporary password, a fixed credential can be set as an NSSM environment variable before the first start. Re-open NSSM for the Stalwart service:

```powershell
PS> & "C:\Program Files\Stalwart\bin\nssm.exe" edit Stalwart
```

On the **Environment** tab, add:

```
STALWART_RECOVERY_ADMIN=admin:mySecretPass
```

Save the change and restart the service:

```powershell
PS> Restart-Service Stalwart
```

The administrator credentials will match the configured value and no temporary password will be generated.

## Open the setup wizard

<SetupWizard />

### Restart service

Once the wizard has been completed, restart the Windows service so that the new configuration takes effect. In an **elevated PowerShell** window (the same admin session used during installation), run:

```powershell
PS> Restart-Service Stalwart
```

<NextSteps />
