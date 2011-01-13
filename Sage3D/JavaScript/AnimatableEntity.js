if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("AnimatableEntity.js");

include("Mesh.js");
include("Texture.js");

/**
 * AnimatableEntity Class
 * @param {String} name Name
 * @param {Mesh} mesh Meshes
 * @param {TextureArray} textures Textures
 */
AnimatableEntity = function(name, upAxis, geometry, skeleton, materials) {
  this.currentAnimation = undefined;
  this.webGL = Root.getInstance().getWebGL();
  this.name = name;
  this.upAxis = upAxis;
  this.geometry = geometry;
  this.skeleton = skeleton;
  this.materials = materials;
  
  this.meshes = [];
  this.textures = [];
  
  this.calcMesh();
  
  for (var id in materials) {
    this.textures.push(materials[id]);
  }
};

/**
 * Destroy
 */
AnimatableEntity.prototype.destroy = function() {
  for (var i = 0; i < this.meshes.length; ++i) {
   this.meshes[i].destroy();
   delete this.meshes[i];
  }
  delete this.meshes;
}

/**
 * Draw the AnimatableEntity
 * @param {Program} shaderProgram Shader program 
 */
AnimatableEntity.prototype.draw = function(shaderProgram) {
  for (var i = 0; i < this.textures.length; ++i) {
    this.textures[i].active(shaderProgram);
  }

  for (var i = 0; i < this.meshes.length; ++i) {
    this.meshes[i].draw(shaderProgram);
  }
};

/**
 * Heavy calculations. Try to use GLSL instead.
 */
AnimatableEntity.prototype.calcMesh = function() {
    
  for (var i = 0; i < this.geometry.triangles.length; ++i) {
    var buffers = new Array(this.geometry.triangles[i].inputs.length);
    var triangles = this.geometry.triangles[i];

    var IEnd = triangles.count * triangles.stride;
    for (var j = 0; j < IEnd; ++j) {
      var indices = triangles.indices;
      var PPos = j * triangles.stride;
      
      for (var k = 0; k < triangles.inputs.length; ++k) {
        if (!buffers[k]) {
          buffers[k] = [];
        }
        var inputs = triangles.inputs[k];
        var source = inputs.source;
        var IPos = indices[PPos + inputs.offset] * source.stride;
        
        if (source.stride == 3) {
          var x = source.valuesArray[IPos + 0];
          var y = source.valuesArray[IPos + 1];
          var z = source.valuesArray[IPos + 2];
          
          switch(this.upAxis) {
            case 'X_UP':
              var tmp = x;
              x = -y;
              y = tmp;
            break;
            case 'Z_UP':
              var tmp = y;
              y = z;
              z = -tmp;
            break;
          }
          buffers[k].push(x);
          buffers[k].push(y);
          buffers[k].push(z);
        }
        else {
          for (var l = 0; l < source.stride; ++l) {
            buffers[k].push(source.valuesArray[IPos + l]);
          }
        }
      }
    }
    if (!this.meshes[i]) {
      var mesh = new Mesh(this.name + '_' + i);
    
      for (var j = 0; j < triangles.inputs.length; ++j) {
    //juste pour screenshot forum eip triangles -> lines
    //MODIFS
    /*    
    var newBuff = new Array();
    for (var k = 0; k < triangles.count; ++k) {
    
      if (triangles.inputs[j].source.stride == 3) {
        // p1(xyz), p2(xyz), p3(xyz)
        // p1(xyz), p2(xyz), p2(xyz), p3(xyz), p3(xyz), p1(xyz)
        var p1 = {
          x:  buffers[j][k * 9 + 0],
          y:  buffers[j][k * 9 + 1],
          z:  buffers[j][k * 9 + 2]
        };
        var p2 = {
          x:  buffers[j][k * 9 + 3],
          y:  buffers[j][k * 9 + 4],
          z:  buffers[j][k * 9 + 5]
        };
        var p3 = {
          x:  buffers[j][k * 9 + 6],
          y:  buffers[j][k * 9 + 7],
          z:  buffers[j][k * 9 + 8]
        };
        
        newBuff.push(p1.x); newBuff.push(p1.y); newBuff.push(p1.z);
        newBuff.push(p2.x); newBuff.push(p2.y); newBuff.push(p2.z);
        newBuff.push(p2.x); newBuff.push(p2.y); newBuff.push(p2.z);
        newBuff.push(p3.x); newBuff.push(p3.y); newBuff.push(p3.z);
        newBuff.push(p3.x); newBuff.push(p3.y); newBuff.push(p3.z);
        newBuff.push(p1.x); newBuff.push(p1.y); newBuff.push(p1.z);
      }
      else if (triangles.inputs[j].source.stride == 2) {
        // p1(uv), p2(uv), p3(uv)
        // p1(uv), p2(uv), p2(uv), p3(uv), p3(uv), p1(uv)
        var p1 = {
          u:  buffers[j][k * 6 + 0],
          v:  buffers[j][k * 6 + 1]
        };
        var p2 = {
          u:  buffers[j][k * 6 + 2],
          v:  buffers[j][k * 6 + 3]
        };
        var p3 = {
          u:  buffers[j][k * 6 + 4],
          v:  buffers[j][k * 6 + 5]
        };
        
        newBuff.push(p1.u); newBuff.push(p1.v);
        newBuff.push(p2.u); newBuff.push(p2.v);
        newBuff.push(p2.u); newBuff.push(p2.v);
        newBuff.push(p3.u); newBuff.push(p3.v);
        newBuff.push(p3.u); newBuff.push(p3.v);
        newBuff.push(p1.u); newBuff.push(p1.v);

      }
      else {
        newBuff = buffers[j];
      }
    }
    mesh.addBuffer(triangles.inputs[j].semantic, this.webGL.ARRAY_BUFFER, newBuff, Math.floor(newBuff.length / triangles.inputs[j].source.stride), this.webGL.FLOAT, triangles.inputs[j].source.stride, this.webGL.STATIC_DRAW);
    */
    //FIN MODIFS
        mesh.addBuffer(this.geometry.triangles[i].inputs[j].semantic, this.webGL.ARRAY_BUFFER, buffers[j], Math.floor(buffers[j].length / this.geometry.triangles[i].inputs[j].source.stride), this.webGL.FLOAT, this.geometry.triangles[i].inputs[j].source.stride, this.webGL.STATIC_DRAW);
      if (triangles.inputs[j].semantic == "POSITION") {
          mesh.calcBBox(buffers[j]);
          mesh.setDrawingBuffer(triangles.inputs[j].semantic);
        }
       this.meshes[i] = mesh;
      }
    }
  }
};
/**
 * Add entity to animator with his selected animation
 */
AnimatableEntity.prototype.animate = function(animeName){
  //anim = parcour array anim to find animeName
//animator::getinstance().addEntityToAnim(this, anim);
};