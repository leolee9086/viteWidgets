const express = require('express')
let router = express.Router()
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
let 数据路径 = path.join(window.siyuan.config.system.workspaceDir,'data','widgetsData','sphereViewer')
if(fs.existsSync(数据路径)){
    router.use('/widgetData',express.static(数据路径))
    router.use('/widgetApi/projects/listAllProjects',(req,res)=>{
        res.json(fs.readdirSync(数据路径))
    })
    router.post('/widgetApi/projects/getScenesByName',
    (req,res,next)=>{
        req.headers['content-type']='application/json'
        next()
    },
    bodyParser.json(),
    (req,res)=>{
        let {name} =  req.body
        let 场景列表 = []
        let 项目文件列表 = fs.readdirSync(path.join(数据路径,name))
        项目文件列表.forEach(
            路径名=>{
                let 缩略图路径 
                if( fs.existsSync(path.join(数据路径,name,路径名,'thumbnail.jpg'))){
                    缩略图路径 = path.join('/widgetData',name,路径名,'thumbnail.jpg').replace(/\\/g,'/')
                }else if(  fs.existsSync(path.join(数据路径,name,路径名,'_f.jpg'))  ){
                    缩略图路径=path.join('/widgetData',name,路径名,'_f.jpg').replace(/\\/g,'/')
                }else if(  fs.existsSync(path.join(数据路径,name,路径名,'sphere.jpg'))  ){
                    缩略图路径=path.join('/widgetData',name,路径名,'sphere.jpg').replace(/\\/g,'/')
                }
                if(fs.existsSync(path.join(数据路径,name,路径名,'_b.jpg'))){
                    场景列表.push(
                        {
                            id:路径名,
                            panorama:{
                                left:   path.join('/widgetData',name,路径名,'_r.jpg').replace(/\\/g,'/'),
                                front:  path.join('/widgetData',name,路径名,'_b.jpg').replace(/\\/g,'/'),
                                right:  path.join('/widgetData',name,路径名,'_l.jpg').replace(/\\/g,'/'),
                                back:   path.join('/widgetData',name,路径名,'_f.jpg').replace(/\\/g,'/'),
                                top:    path.join('/widgetData',name,路径名,'_u.jpg').replace(/\\/g,'/'),
                                bottom: path.join('/widgetData',name,路径名,'_d.jpg').replace(/\\/g,'/'),
                              },
                            thumbnail:缩略图路径,
                            options:{
                                caption:name,
                            }
                        }
                    )

                }

                else if(fs.existsSync(path.join(数据路径,name,路径名,'sphere.jpg'))){
                    场景列表.push(
                        {
                            id:路径名,
                            panorama:path.join('/widgetData',name,路径名,'sphere.jpg').replace(/\\/g,'/'),
                            options:{
                                caption:name,
                            },
                            thumbnail:缩略图路径,

                        }
                    )
                }
            }
        )
        res.json(场景列表)
    })
}
module.exports=router