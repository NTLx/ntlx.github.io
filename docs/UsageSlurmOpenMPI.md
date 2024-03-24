# Usage of Slurm and OpenMPI

## Slurm使用

Slurm是一个强大的作业调度和集群管理工具，适用于各种规模的高性能计算环境。

> 通过命令行使用Slurm

1. **提交作业**：

你可以使用`sbatch`命令来提交批处理作业，或者使用`srun`命令来提交交互式作业。例如：

```bash
sbatch myscript.sh
srun --pty /bin/bash
```

其中，`myscript.sh`是你的作业脚本，`/bin/bash`是你想要在交互式作业中运行的命令。

2. **指定CPU**：

你可以使用`-c`或`--cpus-per-task`选项来指定每个任务需要的CPU数量。例如：

```bash
sbatch -c 4 myscript.sh
srun --cpus-per-task=4 --pty /bin/bash
```

3. **指定内存**：

你可以使用`--mem`选项来指定作业需要的内存数量。例如：

```bash
sbatch --mem=8G myscript.sh
srun --mem=8G --pty /bin/bash
```

这些命令将为作业分配8GB的内存。

4. **指定GPU**：

你可以使用`--gres`选项来指定作业需要的GPU数量。例如：

```bash
sbatch --gres=gpu:2 myscript.sh
srun --gres=gpu:2 --pty /bin/bash
```

这些命令将为作业分配2个GPU。

5. **指定队列**：

你可以使用`-p`或`--partition`选项来指定作业需要提交到的队列。例如：

```bash
sbatch -p myqueue myscript.sh
srun --partition=myqueue --pty /bin/bash
```

其中，`myqueue`是你想要提交作业到的队列的名称。

6. **指定任务数**:

在使用Slurm时，你可以使用`-n`或`--ntasks`选项来指定任务数。例如：

```bash
sbatch -n 10 myscript.sh
srun --ntasks=10 --pty /bin/bash
```

这些命令将会启动10个任务。

你也可以使用`--ntasks-per-node`选项来指定每个节点上的任务数。例如：

```bash
sbatch --ntasks-per-node=5 myscript.sh
srun --ntasks-per-node=5 --pty /bin/bash
```

这些命令将会在每个节点上启动5个任务。

### 更多资料

1. **[知乎专栏：Slurm 作业调度系统使用指南](https://zhuanlan.zhihu.com/p/356415669)**:
   - 这个专栏提供了关于Slurm的详细指南，包括Slurm命令、节点状态、作业队列、作业提交等方面的内容。适合初学者和进阶用户。

2. **[Slurm中英文对照文档](https://docs.slurm.cn/)**:
   - 这个文档适用于Slurm 22.05版，提供了详细的中英文对照文档。你可以在这里找到Slurm的最新信息和用法。

3. **[腾讯云开发者社区的Slurm学习笔记](https://cloud.tencent.com/developer/article/1769654)**:
   - 这篇文章介绍了Slurm的基本概念、作业提交、队列管理等内容。适合初学者入门。

4. **[Slurm官方文档](https://slurm.schedmd.com/documentation.html)**:
   - 官方文档包含了Slurm的详细信息，包括命令、选项、作业数组支持、异构作业支持、CPU管理等。适合专家级用户深入学习。

5. **[CSDN博客：SLURM作业系统学习网站](https://blog.csdn.net/qq_51306571/article/details/136253170)**:
   - 这个博客不定期更新，提供了Slurm作业调度系统的学习资源。你可以在这里找到有关作业提交、队列管理、作业取消等方面的信息。

## OpenMPI使用

OpenMPI是一个免费且开源的MPI实现，兼容MPI-1和MPI-2标准。它在大多数高性能计算平台上都有很高的性能表现。

> 通过命令行使用OpenMPI

为OpenMPI创建`hostfile`配置文件:

```
slurmmaster slots=4
slurm1 slots=4
slurm2 slots=4
```

```shell
mpirun -n 2 -hostfile hostfile --allow-run-as-root ./your_app
```

### 更多资料

1. **[MPI教程介绍](https://mpitutorial.com/tutorials/mpi-introduction/zh_cn/)**:
   - 这个教程提供了关于MPI的详细指南，从初学者到专家级用户都适用。你可以在这里学习并行编程、分布式编程以及MPI的基本概念、命令和用法。

2. **[上海交大超算平台用户手册：OpenMPI](https://docs.hpc.sjtu.edu.cn/app/compilers_and_languages/open_mpi.html)**:
   - 这份文档详细介绍了OpenMPI的安装、使用和性能优化。适合初学者入门和专家深入学习。

3. **[CSDN博客：OpenMPI入门1-安装与测试](https://blog.csdn.net/qq_26822029/article/details/107930758)**:
   - 这篇博客记录了OpenMPI的基本使用，包括安装和测试。适合初学者快速上手。

4. **[知乎专栏：并行计算技术解密：MPI和OpenMP的学习和应用指南](https://zhuanlan.zhihu.com/p/632362143)**:
   - 这个专栏深入介绍了MPI和OpenMP这两种重要的并行计算技术，适合科研工作者、开发人员和对高性能计算感兴趣的学生。

# Slurm+OpenMPI

在使用Slurm提交MPI作业时，你不需要在命令行中显式地指定调用MPI。Slurm会自动处理MPI环境的设置。

你只需要在你的作业脚本中使用`mpirun`或`mpiexec`命令来启动你的MPI程序。例如，你的作业脚本可能看起来像这样：

```bash
#!/bin/bash
#SBATCH --job-name=my_mpi_job
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=16
#SBATCH --time=01:00:00
#SBATCH --partition=standard
#SBATCH --output=my_mpi_job.out

mpirun /path/to/my/mpi/program
```

在这个例子中，`mpirun /path/to/my/mpi/program`这行命令将会启动你的MPI程序。Slurm会自动将MPI进程分配到你在作业脚本中指定的节点和CPU上。