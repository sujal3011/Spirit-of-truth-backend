const mongoose = require('mongoose');

const CreationRequestSchema = new mongoose.Schema({

    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
      },
    entityId: {
        type: mongoose.Schema.Types.Mixed,
        refPath: 'entityType'
    },
    entityType: {
        type: String,
        enum: ['Course', 'Module', 'Section']
    }

  },{ timestamps: true });
  
const CreationRequest = mongoose.model('creationrequest', CreationRequestSchema);
module.exports = CreationRequest;