---
title: "CPU instruction sets"
description: "Which vector instruction sets Stalwart uses to parse and encode messages, how to check that a host or virtual machine exposes them, and how to build for the local CPU."
sidebar_position: 10
---

Much of the work a mail server does on every message is byte scanning and conversion. The server has to find the end of each header field and locate the MIME boundaries in the body. It decodes base64 and quoted-printable content, encodes attachments for delivery and validates UTF-8 text. Each of these operations touches every byte of the message, so their cost grows with the volume of mail.

Stalwart performs these operations with vector (SIMD) instructions when the processor supports them. A vector instruction processes 16 or 32 bytes at once. The same code paths run when messages are received over SMTP, imported, indexed for search, and served to IMAP, JMAP, POP3 and WebDAV clients. The instruction sets available to the server therefore affect the cost of nearly every message it handles, and this page describes which ones it uses and how to make sure a host exposes them.

## Instruction set selection

The official binaries and container images are built for the baseline of each architecture, with no minimum CPU level above it, so they start on any processor of that architecture. To use the faster instructions anyway, the server on x86_64 detects the processor's capabilities at run time and picks the fastest implementation available. The following table lists the instruction sets used on each architecture and how they are selected:

| Architecture | Instruction sets used | Selection |
|---|---|---|
| x86_64 | AVX2, then SSSE3, then SSE2; SSE4.2 for UTF-8 validation | Detected at run time |
| aarch64 | NEON (Advanced SIMD) | Always present, as part of the ARMv8-A baseline |
| ARMv7, ARMv6 | None | Portable implementation |

Because the choice is made at run time, a processor without AVX2 or SSSE3 runs the same binary with a slower implementation of the same operations. Nothing fails to start and no output changes; only the CPU time per message differs. AVX-512 and SVE are not used for message parsing and encoding, so a processor that lacks them loses nothing there.

## Choosing a CPU

Run Stalwart on an x86_64 processor that supports AVX2, or on any aarch64 processor. Every x86-64-v3 processor supports AVX2, and every aarch64 processor has NEON, so on these processors the scanning and encoding of messages runs on the widest vector paths. On an older x86_64 processor, or on a virtual machine that hides AVX2 from its guest, the same work takes more CPU time. The difference grows with the volume of mail and the size of the messages, so it matters most on a busy server. The 32-bit ARM builds have no vector paths at all and suit small installations only.

The size of the difference for each operation is measured by the benchmarks published with Stalwart's base64, base32 and quoted-printable encoder and with its message parser. They report the throughput of each operation for AVX2, SSSE3, NEON and the portable code. The effect on a whole server depends on the workload, because password hashing, spam filtering, TLS and the data store also consume CPU, as described in [System requirements](/docs/install/requirements#cpu).

## Check a host

Before choosing a host, or when the CPU use per message is higher than expected, check which instruction sets the processor exposes to the server. On Linux, the `flags` line of `/proc/cpuinfo` lists the instruction sets of an x86_64 processor. The following command prints the ones Stalwart uses, of which `avx2` matters most:

```sh
grep -o -w -E 'avx2|ssse3|sse4_2' /proc/cpuinfo | sort -u
```

`lscpu` prints the same flags on its `Flags:` line. On systems with glibc 2.33 or later, the dynamic loader can also report which x86-64 levels the processor supports. A processor with AVX2 reports at least `x86-64-v3`, and the following command prints the list:

```sh
ld.so --help | grep -A4 'glibc-hwcaps directories'
```

```text
Subdirectories of glibc-hwcaps directories, in priority order:
  x86-64-v4
  x86-64-v3 (supported, searched)
  x86-64-v2 (supported, searched)
```

Where `ld.so` is not on the path, run the loader directly as `/lib64/ld-linux-x86-64.so.2 --help`. Systems based on musl, such as Alpine Linux, have no such option, so `/proc/cpuinfo` is the way to check there.

Other platforms report the same information differently. On an aarch64 Linux host, NEON appears as `asimd` on the `Features` line of `/proc/cpuinfo`. On macOS, Apple silicon always supports NEON, and `sysctl hw.optional.neon` prints `1`. On an Intel Mac, `sysctl hw.optional.avx2_0` prints `1` when the processor supports AVX2.

## Containers and virtual machines

Containers and virtual machines behave differently here. A container runs directly on the host's processor, so a container image detects the same instruction sets as a binary installed on the host. A virtual machine sees only what the hypervisor presents to it: the hypervisor decides which instruction sets the guest sees, and a generic virtual CPU model hides AVX2 even on a processor that has it. For this reason, run the checks above inside the guest, because the hypervisor host can report flags that the guest does not see.

Each hypervisor has a setting that exposes the host processor to a guest:

| Hypervisor | Setting |
|---|---|
| QEMU | Start the guest with `-cpu host`. |
| libvirt | Set `<cpu mode='host-passthrough'/>` in the domain XML. `host-model` also exposes the host's features, approximated by the closest named model. |
| Proxmox VE | Set the CPU type of the virtual machine to `host` in its Hardware settings, or run `qm set <vmid> --cpu host`. The default type for new virtual machines, `x86-64-v2-AES`, does not include AVX2, but `x86-64-v3` does. |

Live migration constrains this choice. A virtualisation cluster that live-migrates virtual machines between hosts of different processor generations needs a CPU baseline common to all hosts, and that baseline masks every feature newer than the oldest host. Exposing the full host processor conflicts with migration: with `host` or `host-passthrough`, migrating a guest to a host whose processor lacks one of the exposed features fails or stops the guest. Where migration is needed, choose a baseline that still includes AVX2. Examples are the `x86-64-v3` type in Proxmox VE, or a VMware EVC mode of the Intel Haswell or AMD Zen generation or later. Hyper-V's processor compatibility mode also limits the processor features presented to the guest, so when it is enabled, check the guest's flags as described above.

On a cloud provider, the instance type determines the processor generation and therefore the instruction sets the guest sees. Run the checks above on a new instance before choosing a type for production.

## Build for the local CPU

A binary [compiled from source](/docs/development/compile) for the default target already contains the run-time detection described above. It uses AVX2 where available without further options, so a custom build is not needed to get the vector paths. A build for the local CPU goes further. With `-C target-cpu=native`, the compiler may use every instruction set of the build host throughout the binary, including in code that has no run-time detection:

```sh
RUSTFLAGS="-C target-cpu=native" cargo build --release -p stalwart --no-default-features --features "rocks redis enterprise"
```

The cost of this is portability. A binary built this way runs only on processors that support every instruction set of the build host. On a processor that lacks one of them, the server stops with an illegal instruction error. This can happen after a virtual machine is migrated to an older host, or when the binary is copied to another machine. To avoid it, build on the machine that runs the server, or name an explicit level that every host in the deployment supports, such as `-C target-cpu=x86-64-v3`.
