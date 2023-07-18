---
title: K8S使用kubeadm初始化
date: 2023-07-18 23:37:10
category: Deploy
tag:
    - k8s
    - kubeadm
---

# Kubernetes 集群初始化

## K8S 版本

使用`v1.23.9`

[官方下载地址](https://www.downloadkubernetes.com/)

注意选择对应的`linux`系统架构以及版本

## 安装 kubeadm

[官网地址](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

避免网络下载缓慢，下载依赖包文件:

```
链接: https://pan.baidu.com/s/1eshofN6Ac3grVX4QDxnvrA 提取码: kh98
```

安装脚本

```shell
#!/bin/sh
# 指定文件包路径
K8S_INSTALL_PKG=~/k8s_install/k8s_install_pkg
# 安装CNI插件
CNI_VERSION="v0.8.2"
ARCH="amd64"
sudo mkdir -p /opt/cni/bin
#curl -L "https://github.com/containernetworking/plugins/releases/download/${CNI_VERSION}/cni-plugins-linux-${ARCH}-${CNI_VERSION}.tgz" | sudo tar -C /opt/cni/bin -xz
tar -zxvf $K8S_INSTALL_PKG/cni-plugins-linux-${ARCH}-${CNI_VERSION}.tgz -C /opt/cni/bin
# 指定可执行目录地址
DOWNLOAD_DIR=/usr/local/bin
sudo mkdir -p $DOWNLOAD_DIR

# 安装crictl
CRICTL_VERSION="v1.22.0"
ARCH="amd64"
#curl -L "https://github.com/kubernetes-sigs/cri-tools/releases/download/${CRICTL_VERSION}/crictl-${CRICTL_VERSION}-linux-${ARCH}.tar.gz" | sudo tar -C $DOWNLOAD_DIR -xz
tar -zxvf $K8S_INSTALL_PKG/crictl-${CRICTL_VERSION}-linux-${ARCH}.tar.gz -C $DOWNLOAD_DIR
#安装kubeadm kubelete kubectl
#RELEASE="$(curl -sSL https://dl.k8s.io/release/stable.txt)"
RELEASE="v1.23.9"
ARCH="amd64"
cd $DOWNLOAD_DIR
#sudo curl -L --remote-name-all https://storage.googleapis.com/kubernetes-release/release/${RELEASE}/bin/linux/${ARCH}/{kubeadm,kubelet,kubectl}
cd $K8S_INSTALL_PKG
cp kubeadm kubelet kubectl $DOWNLOAD_DIR/
cd $DOWNLOAD_DIR
sudo chmod +x kubeadm kubectl kubelet

RELEASE_VERSION="v0.4.0"
#curl -sSL "https://raw.githubusercontent.com/kubernetes/release/${RELEASE_VERSION}/cmd/kubepkg/templates/latest/deb/kubelet/lib/systemd/system/kubelet.service" | sed "s:/usr/bin:${DOWNLOAD_DIR}:g" | sudo tee /etc/systemd/system/kubelet.service
cat $K8S_INSTALL_PKG/kubelet.service | sed "s:/usr/bin:${DOWNLOAD_DIR}:g" | sudo tee /etc/systemd/system/kubelet.service
#sudo mkdir -p /etc/systemd/system/kubelet.service.d
#curl -sSL "https://raw.githubusercontent.com/kubernetes/release/${RELEASE_VERSION}/cmd/kubepkg/templates/latest/deb/kubeadm/10-kubeadm.conf" | sed "s:/usr/bin:${DOWNLOAD_DIR}:g" | sudo tee /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
sudo mkdir -p /etc/systemd/system/kubelet.service.d
cat $K8S_INSTALL_PKG/10-kubeadm.conf | sed "s:/usr/bin:${DOWNLOAD_DIR}:g" | sudo tee /etc/systemd/system/kubelet.service.d/10-kubeadm.conf

# 设置kubelet开启自动自动
systemctl enable --now kubelet
```

```bash
sudo chmod +x k8s_install.sh

# 执行命令
./k8s_install_sh
```

验证安装

> 如果能够在终端使用命令基本安装完成

```bash
kubeadm version
```

> 初始化

```bash
# 查看参数
kubeadm init -h
```

```bash
cd k8s_install_pkg

# 打印默认的配置参数
kubeadm config print init-defaults > kubeadm-init-temp.yaml
```

修改部分内容，给镜像加速，以及对应的节点访问地址

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
    - groups:
          - system:bootstrappers:kubeadm:default-node-token
      token: abcdef.0123456789abcdef
      ttl: 24h0m0s
      usages:
          - signing
          - authentication
kind: InitConfiguration
localAPIEndpoint:
    #节点访问地址
    advertiseAddress: 192.168.10.52
    bindPort: 6443
nodeRegistration:
    criSocket: /var/run/dockershim.sock
    #节点名字
    name: master
    taints: null
---
apiServer:
    timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
    type: CoreDNS
etcd:
    local:
        dataDir: /var/lib/etcd
        #etcd访问地址
        extraArgs:
            listen-client-urls: 'https://127.0.0.1:2379,https://127.0.0.1:2379'
            listen-peer-urls: 'https://127.0.0.1:2380'
#镜像拉取代理地址
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
#k8s版本
kubernetesVersion: 1.21.6
networking:
    dnsDomain: cluster.local
    serviceSubnet: 10.96.0.0/12
    # 决定 pod 的网络分配
    podSubnet: 10.244.0.0/16
scheduler: {}
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
clusterCIDR: '10.244.0.0/16'
# 启用 ipvs 模式
mode: 'ipvs'
```

```bash
# 初始化
kubeadm init --config kubeadm-init.yaml
```

配置环境变量

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

```bash
# 获取节点进行测试
kubectl get nodes

# 查看所有的 pod 网络插件可能会不行
kubectl get pod -A
```

配置网络插件`flannel`

```bash
kubectl apply -f kube-flannel.yml
```

然后再持续使用`kubectl get pod -A`查看是否运行起来
