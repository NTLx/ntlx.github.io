# Slurm & OpenMPI Usage Guide

## 1. Slurm Usage

Slurm is a powerful workload manager and job scheduler for high-performance computing (HPC) clusters.

### Job Submission

- **Batch Job (`sbatch`):** Submit a script for later execution.
- **Interactive Job (`srun`):** Run a job interactively in real-time.

```bash
# Submit a batch script
sbatch myscript.sh

# Start an interactive bash session
srun --pty /bin/bash
```

### Resource Allocation

You can specify resources using command-line flags or `#SBATCH` directives in your script.

| Resource | Flag | Example | Description |
| :--- | :--- | :--- | :--- |
| **CPU** | `-c` / `--cpus-per-task` | `sbatch -c 4 script.sh` | Request 4 CPUs per task. |
| **Memory** | `--mem` | `sbatch --mem=8G script.sh` | Request 8GB of memory per node. |
| **GPU** | `--gres` | `sbatch --gres=gpu:2 script.sh` | Request 2 GPUs. |
| **Partition** | `-p` / `--partition` | `sbatch -p debug script.sh` | Submit to the `debug` partition (queue). |
| **Tasks** | `-n` / `--ntasks` | `sbatch -n 10 script.sh` | Launch 10 tasks (processes). |
| **Tasks/Node** | `--ntasks-per-node` | `sbatch --ntasks-per-node=5` | Launch 5 tasks per node. |

### References

- [Slurm Official Documentation](https://slurm.schedmd.com/documentation.html)
- [Slurm Quick Start User Guide](https://slurm.schedmd.com/quickstart.html)
- [LLNL Slurm User Tutorial](https://hpc.llnl.gov/banks-jobs/running-jobs/slurm-user-manual)

## 2. OpenMPI Usage

OpenMPI is an open-source Message Passing Interface (MPI) implementation.

### Basic Usage

To run an MPI program manually (outside of Slurm), you often need a `hostfile` to specify where to run processes.

**Example `hostfile`:**
```text
node01 slots=4
node02 slots=4
```

**Run Command:**
```bash
mpirun -n 8 -hostfile hostfile ./your_app
```

> [!NOTE]
> `--allow-run-as-root` is required if running as root (not recommended).

### References

- [OpenMPI Documentation](https://www.open-mpi.org/doc/)
- [MPI Tutorial](https://mpitutorial.com/)

## 3. Running MPI Jobs with Slurm

When using Slurm, you typically do **not** need to manually specify nodes or hostfiles. Slurm integrates with MPI to handle process distribution automatically.

### Example Batch Script

Create a script named `job.sh`:

```bash
#!/bin/bash
#SBATCH --job-name=mpi_job
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=16
#SBATCH --time=01:00:00
#SBATCH --partition=standard
#SBATCH --output=mpi_job_%j.out

# Load MPI module if needed
# module load openmpi

# Run the MPI program
# srun is preferred over mpirun within Slurm
srun ./my_mpi_program
```

### Submission

```bash
sbatch job.sh
```

Slurm will allocate 2 nodes with 16 tasks each (32 tasks total) and launch `my_mpi_program` on them.
