本人一人历时一年用cocos2d-js和pomelo从零开始开发MMORPG传奇手游《空空西游》，因新规无法上线，后工作投众多简历均石沉大海。 

apk和iOS安装包放在百度网盘：http://pan.baidu.com/s/1o8mzthS，过了这个月阿里云服务器将过期。 
整个项目的源代码和资源均发布在github上：https://github.com/linyouhappy/kongkongxiyou
国内围墙内用户可以百度网盘下载:http://pan.baidu.com/s/1cxDLBg

现在公布全部源代码，并阐述整个项目的各个开发过程，将从程序、美术、策划三方面进行解析：

1.运行游戏服务端和客户端

2. 解析整个项目的结构

3.解析用shell脚本制作图片资源转换和excel转换批量工具

4.解析js的C++层绑定，js的C++自动和手动绑定

5.解析安卓游戏开发，以及java-jni绑定

6.解析用shell自动批量发安卓apk包

7.解析设计封装各个渠道SDK，以及方便js层调用

8.解析AppStore渠道开发和应用内支付

9.解析客户端的各个模块和功能

10.解析游戏中的美术资源和制作

11.解析游戏中的策划资源和数值填充

12.解析服务端的各个模块和功能

13.解析开发富文本和强大的聊天系统

14.解析阿里云搭建和运行，以及用shell自动维护脚本开发

15.解析pomelo的前后端交互通信

16.解析行为树AI的开发和设计

17.解析寻路算法的开发和设计

18.解析AOI算法的开发和设计



传奇拥有的各种系统基本都完成，就差美术和策划填充。

警告： 
1.本项目首次尝试用js开发前后端大型网游，未经历上线考验。 

2.本项目程序、美术和策划均由我完成，故有些模块没时间完成。 

3.node.js由于太灵活不太适合做多人的大项目，对开发者的能力要求比较高。


优化： 
1.pomelo的消息传输机制太臃肿，应该自己定义一套网络传送机制，幸好js绑定C++模块很容易。 

2.高运算模块使用C++开发，由于时间有限，ai和寻路还是保持js的版本。 

3.尽量减少pomelo的服务器集群的规模。

本项目完全由我一个人完成，授权大家随便使用该项目。使用和转发需要注明博客地址。
教程：http://blog.csdn.net/linyouhappy
答疑QQ群：277615647