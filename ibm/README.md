# Installing

Follow these steps to install IBM Bob. The setup takes about five minutes.

## System requirements

**Operating Systems**: macOS, Linux, or Windows

**Memory**: Minimum 4 GB RAM (8 GB recommended)

**Storage**: At least 500 MB available disk space

**Network**: Active internet connection

**Step 1:**

## Download IBM Bob

**[Get the installer](https://bob.ibm.com/download)** - Choose the correct version for your operating system.

**macOS:**

> **Tip:**
> To determine if you should choose the mac ARM or mac Intel installer:
>
>             1. Click the Apple logo in the top left of the navigation menu.
>             2. Click **About This Mac** and check the **Chip** information. For Apple M1, M2, M3, etc., choose mac-ARM. For Intel, choose mac-Intel.

1. Download, then open the `.pkg` file for macOS.
2. Complete the steps in the installation wizard.

**Linux:**

**Debian:**

1. Download the `.deb` file from the download page.
2. Install with your package manager, or run the following command:

```bash
sudo apt install ./IBM-Bob-linux-amd64-1.105.1+bob1.0.0.deb
```

**Red Hat and Fedora:**

1. Download the `.rpm` file from the download page.
2. Install with your package manager, or run the following command:

```bash
sudo dnf install ./IBM-Bob-linux-x64-1.105.1+bob1.0.0.rpm
```

**Windows:**

1. Download the `.exe` installer for Windows.
2. Run the downloaded `.exe` installer.
3. Follow the installation wizard prompts.
4. Choose your installation directory (default is recommended).
5. Click **Finish** to complete the installation.

**Step 2:**

## Sign in with your IBMid

> **Note:**
> An IBMid is required to authenticate. If you do not have one, see [Create an IBMid](https://www.ibm.com/account/reg/us-en/signup?formid=urx-19776).

Open Bob from your applications menu or desktop shortcut. On first launch, Bob will prompt you to sign in:

1. Follow the authentication flow with your browser to login with your IBMid.
2. Return to Bob after authentication is complete.

> **Note:**
> If you experience network issues with outbound traffic, you might need to configure your firewall or proxy settings. For more information, see [Configuring firewall rules](/docs/ide/troubleshooting/ts-firewall-rules) or [Configuring proxy settings](/docs/ide/troubleshooting/ts-proxy).

## Next steps
Explore the following topics to get started using Bob:

**[Best practices](/docs/ide/getting-started/best-practices)**: Learn effective strategies for working with Bob

**[Chat interface](/docs/ide/features/chat-interface)**: Explore Bob's chat interface and features

**[Modes](/docs/ide/features/modes)**: Learn about specialized modes and when to use them

**[Custom modes](/docs/ide/configuration/custom-modes)**: Create specialized workflows

**[Custom instructions](/docs/ide/configuration/rules)**: Add project-specific preferences

**[MCP servers](/docs/ide/configuration/mcp/mcp-in-bob)**: Configure extended capabilities

**[Security guidelines](/docs/ide/security/bob-security-guidance)**: Understand best practices for secure usage

## Getting help
If you need assistance:

**[FAQ](/docs/ide/faq)**: Find answers to common questions