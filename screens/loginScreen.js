import React from 'react';
import { Text, View, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import firebase from 'firebase'
import db from '../config'
export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state={
            emailId:"",
            password:""
        }
    }
    login=async(emailId,password)=>{
        if(emailId && password){
            try{
                const reponse=await firebase.auth().signInWithEmailAndPassword(emailId,password)
                if(reponse){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case "auth/user-not-found":
                        alert("user does not exist")
                        break
                    case "auth/invalid-email":
                        alert("incorrect email or password")

                }
            }
            
        }
        else{
            alert("enter email and password")
        }
    }
    render(){
    return(
        <View>
<KeyboardAvoidingView>
    <View>
<Image source={require("../assets/booklogo.jpg")} style={{width:100,height:100}}></Image>

    </View>
    <View>
        <TextInput
        placeholder="abc@example.com"
        keyboardType="email-address"
        onChangeText={text=>{
           this.setState({
               emailId:text
           })
        }}
        ></TextInput>
         <TextInput
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={text=>{
           this.setState({
               password:text
           })
        }}
        ></TextInput>
        <View>
          <TouchableOpacity onPress={()=>{
              this.login(this.state.emailId,this.state.password)
          }} >
              <Text>Login</Text>

          </TouchableOpacity>
        </View>
    </View>
</KeyboardAvoidingView>
        </View>
    )
    }

}