## Step 2: Open the setup wizard

At its first start the server finds no configuration file and therefore starts in [bootstrap mode](/docs/configuration/bootstrap-mode). In this mode it serves only the setup wizard, over plain HTTP on port 8080, and creates a temporary administrator account with which the administrator signs in to it. This step retrieves that account's password and opens the wizard.
