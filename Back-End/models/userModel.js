const mongoose=require('mongoose');
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const { type } = require('os');
const userSchema=new mongoose.Schema({
    name:{
        type:String,required:[true,'Pleae enter your  name']
    },
    email:{
        type:String,required:[true,'Pleae enter your  email'],unique:true,
        validate:
        [validator.isEmail,'please enter email address correctly']
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        minLength:[6,"password must be 6 characters long"],
        select:false,
    },
     otp:{
        type:String,
        required:false
     },
     otpExpire:{
        type:Date,
        required:false
     },
     isVerified:{
        type:Boolean,
        required:false
     },
     role:{
        type:String,
        default:'user'
     },

createdAt:{
    type:Date,
    default:Date.now
},

})

userSchema.pre('save',async function(next){ ///hashing password
    if(!this.isModified('password')){
        return next()
    }
    try{
        const saltRounds=10;
        this.password=await bcrypt.hash(this.password,saltRounds);
        next();

    }
    catch(err)
    {
        next (err)
    }
})
userSchema.methods.comparePassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getJwtToken=function()
{
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}
userSchema.statics.findByCredentials=async function(email,password){
    const user=await this.findOne({email}).select('+password');
    if(!user)
    {
        throw new Error('Invalid email or password');

    }
    const isPasswordMatch=await bcrypt.compare(password,user.password);
    if(!isPasswordMatch)
    {
        throw new Error('Invalid email or password');
    }
    return user;
}

module.exports=mongoose.model('User',userSchema)