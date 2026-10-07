import * as THREE from 'three';
// Image-based lighting keeps glazing stable during entry and orbit. No recursive
// scene captures or alternating low-resolution mirror frames over the displays.
export function createGlazing(){
 const glass=new THREE.MeshPhysicalMaterial({color:0x91afc5,metalness:.12,roughness:.20,transparent:true,opacity:.032,clearcoat:.35,clearcoatRoughness:.20,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
 function add(parent,width,height){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),glass);mesh.position.z=.045;mesh.castShadow=mesh.receiveShadow=false;parent.add(mesh);return mesh}
 return{add,update(){}};
}
