import { Viewer } from 'photo-sphere-viewer';
import {GalleryPlugin} from 'photo-sphere-viewer/dist/plugins/gallery.js'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
import 'photo-sphere-viewer/dist/plugins/gallery.css'
import {CubemapAdapter} from 'photo-sphere-viewer/dist/adapters/cubemap.js'
import { 获取地址参数 } from '../../whiteBoard/src/data';
import {sql全景图适配器} from "./adapters/sql.js"
import {后端适配器} from './adapters/internal.js'
let {project} =获取地址参数()
console.log(project)
let 当前适配器 = new 后端适配器()
let 全景图列表=  await 当前适配器.获取全景图列表(project) 
let 全景图选项 = {
  container: document.querySelector('#viewer'),
  panorama: 全景图列表[0].panorama,
  plugins: [
    [GalleryPlugin, {
      visibleOnLoad: true,
    }],
  ],
}

if(全景图列表[0].panorama.left){
  全景图选项.adapter = CubemapAdapter
}
let viewer= new Viewer(全景图选项)

const gallery = viewer.getPlugin(GalleryPlugin);
gallery.setItems(全景图列表)
