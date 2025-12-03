# Slurm & OpenMPI Installation Guide

## 1. Introduction

- **Slurm**: A highly scalable cluster management and job scheduling system.
- **OpenMPI**: A high-performance message passing library.

> [!NOTE]
> **Environment Details:**
> - **OS**: Ubuntu 22.04 LTS
> - **Slurm Version**: 21.08
> - **Shared Directory**: `/shared_workdir` (NFS)
> - **Nodes**:
>   - `slurmmaster` (192.168.120.133): Controller Node
>   - `slurm1` (192.168.120.131): Compute Node
>   - `slurm2` (192.168.120.132): Compute Node

## 2. Common Configuration (All Nodes)

Perform these steps on **all nodes** (Master and Clients).

### 2.1 Hostname Resolution

Edit `/etc/hosts` to ensure all nodes can resolve each other by name.

```ini
192.168.120.133 slurmmaster
192.168.120.131 slurm1
192.168.120.132 slurm2
```

### 2.2 SSH Keys

Generate SSH keys on all nodes.

```bash
sudo ssh-keygen -t rsa
```

### 2.3 Enable Root SSH Login

1.  **Set Root Password**:
    ```bash
    sudo passwd root
    ```
2.  **Configure SSH**:
    Edit `/etc/ssh/sshd_config` and set:
    ```ini
    PermitRootLogin yes
    ```
3.  **Restart SSH**:
    ```bash
    sudo systemctl restart sshd
    ```

## 3. Master Node Configuration (`slurmmaster`)

Perform these steps **only on the Master Node**.

### 3.1 SSH Trust

Exchange SSH keys to allow passwordless login between nodes.

```bash
sudo su
# Collect public keys
cp /root/.ssh/id_rsa.pub slurmmaster.pub
scp root@slurm1:/root/.ssh/id_rsa.pub slurm1.pub
scp root@slurm2:/root/.ssh/id_rsa.pub slurm2.pub

# Merge keys
cat slurm*.pub >> /root/.ssh/authorized_keys

# Distribute authorized_keys
scp /root/.ssh/authorized_keys root@slurm1:/root/.ssh/authorized_keys
scp /root/.ssh/authorized_keys root@slurm2:/root/.ssh/authorized_keys
```

### 3.2 NFS Server

Install and configure NFS to share the working directory.

```bash
# Install NFS Server
sudo apt install nfs-kernel-server

# Create Shared Directory
sudo mkdir -p /shared_workdir
sudo chmod -R 777 /shared_workdir
```

Edit `/etc/exports`:
```ini
/shared_workdir 192.168.120.0/24(rw,sync,no_root_squash,no_subtree_check)
```

Restart NFS:
```bash
sudo service rpcbind restart
sudo service nfs-kernel-server restart
```

### 3.3 Install Slurm & Dependencies

```bash
sudo apt install mariadb-server munge slurmd slurmctld slurmdbd openmpi-bin openmpi-common libopenmpi-dev
```

### 3.4 Configure Munge

```bash
# Enable Munge
sudo systemctl enable munge
sudo systemctl start munge

# Distribute Munge Key (Do this AFTER installing munge on clients)
# sudo scp /etc/munge/munge.key root@slurm1:/etc/munge/
# sudo scp /etc/munge/munge.key root@slurm2:/etc/munge/
```

### 3.5 Configure MariaDB

```bash
sudo systemctl enable mariadb
sudo systemctl start mariadb
```

### 3.6 Configure Slurm

Create configuration files:
```bash
sudo touch /etc/slurm/cgroup.conf
sudo touch /etc/slurm/slurm.conf
sudo touch /etc/slurm/slurmdbd.conf
sudo chmod 600 /etc/slurm/slurmdbd.conf
```

#### `cgroup.conf`
```ini
CgroupAutomount=yes
ConstrainCores=no
ConstrainRAMSpace=no
```

#### `slurmdbd.conf`
```ini
AuthType=auth/munge
AuthInfo=/var/run/munge/munge.socket.2
DbdAddr=localhost
DbdHost=localhost
SlurmUser=root
DebugLevel=verbose
LogFile=/var/log/slurm/slurmdbd.log
PidFile=/var/run/slurmdbd.pid
StorageType=accounting_storage/mysql
StoragePass=password
StorageUser=root
StorageLoc=slurm_acct_db
```

#### `slurm.conf` (CPU Only Example)
```ini
ClusterName=cluster
SlurmctldHost=slurmmaster
MpiDefault=pmi2
ProctrackType=proctrack/cgroup
ReturnToService=1
SlurmctldPidFile=/run/slurmctld.pid
SlurmdPidFile=/run/slurmd.pid
SlurmdSpoolDir=/var/lib/slurm/slurmd
SlurmUser=root
StateSaveLocation=/var/lib/slurm/slurmctld
SwitchType=switch/none
TaskPlugin=task/affinity

SchedulerType=sched/backfill
SelectType=select/cons_tres

AccountingStorageType=accounting_storage/slurmdbd
AccountingStorageEnforce=associations,limits,qos
AccountingStorageHost=localhost
AccountingStoragePass=/var/run/munge/munge.socket.2
JobCompHost=localhost
JobCompLoc=slurm_acct_db
JobCompPass=password
JobCompType=jobcomp/mysql
JobCompUser=root

SlurmctldLogFile=/var/log/slurm/slurmctld.log
SlurmdLogFile=/var/log/slurm/slurmd.log

# COMPUTE NODES
NodeName=slurm1 CPUs=4 Sockets=2 CoresPerSocket=2 ThreadsPerCore=1 RealMemory=3876 Gres=gpu:0 State=UNKNOWN
NodeName=slurm2 CPUs=4 Sockets=2 CoresPerSocket=2 ThreadsPerCore=1 RealMemory=3876 Gres=gpu:0 State=UNKNOWN
PartitionName=compute Nodes=slurm[1-2] Default=YES MaxTime=INFINITE State=UP
```

### 3.7 Start Slurm Services

```bash
sudo systemctl enable slurmdbd
sudo systemctl start slurmdbd
sudo systemctl enable slurmctld
sudo systemctl start slurmctld
```

## 4. Client Node Configuration (`slurm1`, `slurm2`)

Perform these steps **only on Client Nodes**.

### 4.1 NFS Client

```bash
sudo apt install nfs-common
sudo mkdir -p /shared_workdir
sudo chmod -R 777 /shared_workdir
```

Mount NFS share:
```bash
sudo mount -t nfs slurmmaster:/shared_workdir /shared_workdir
```

Auto-mount on boot (Add to `/etc/fstab`):
```ini
slurmmaster:/shared_workdir /shared_workdir nfs defaults 0 0
```

### 4.2 Install Slurm Client

```bash
sudo apt install munge slurm-client slurmd openmpi-bin openmpi-common libopenmpi-dev
```

### 4.3 Configure Munge

1.  **Receive Key**: Ensure `munge.key` is copied from Master.
2.  **Restart Munge**:
    ```bash
    sudo systemctl restart munge
    ```

### 4.4 Configure Slurm

Copy `slurm.conf` and `cgroup.conf` from Master to `/etc/slurm/`.

If using GPUs, create `gres.conf`:
```ini
Name=gpu Type=A800 File=/dev/nvidia[0-7]
```

### 4.5 Start Slurm Daemon

```bash
sudo systemctl enable slurmd
sudo systemctl start slurmd
```
