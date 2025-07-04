import mongoose, { Schema, Document, Types } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

interface IUser extends Document {
    username:string;
    password:string;
    email:{type:string,unique:true}
}

interface ITags extends Document {
    title:{type:string,unique:true,required:true};
}

interface IContents extends Document {
    link: { type: string; required: true };
    title: { type: string; required: true };
    type: { type: string; required: true };
    tags: [{ type: Types.ObjectId }];
    userId: { type: Types.ObjectId,required:true };
}

interface ILinks extends Document {
    hash: { type: string; required: true };
    user:{type:Types.ObjectId,required:true};
}



const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true }
})


const TagsSchema = new Schema<ITags>({
    title: { type: String, unique: true, required: true }
})


const ContentsSchema = new Schema<IContents>({
    link: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    tags: [{ type: ObjectId, ref: 'Tags' }],
    userId: { type: ObjectId, ref: 'User', required: true }
})


const LinksSchema = new Schema<ILinks>({
    hash: { type: String, required: true },
    user: { type: ObjectId, ref: 'User', required: true }       
})



const userModel = mongoose.model<IUser>('user', UserSchema);
const tagsModel = mongoose.model<ITags>('tags', TagsSchema);
const contentModel = mongoose.model<IContents>('contents',ContentsSchema);
const linksModel = mongoose.model<ILinks>('links',LinksSchema);

export{userModel,tagsModel,contentModel,linksModel};