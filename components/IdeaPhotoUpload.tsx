import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator} from 'react-native'; 
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { isEmpty } from 'lodash';

const IdeaImageUpload = ({onImageChanged}) => {

    const [ ideaImage, setIdeaImage ] = useState({});
    const [ imageTitle, setImageTitle ] = useState();

    const [image] = useState({})

    const [ loadingImage, setLoadingImage ] = useState(false);

    useEffect(() => {
        if(isEmpty(ideaImage)) return;

        image.url = ideaImage.uri;
        image.title = imageTitle;

        onImageChanged(image);
    }, [ideaImage, imageTitle])

    const pickImage = async () => {
        setLoadingImage(true);

        try{
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status == 'granted') {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [ 1, 1 ]
                })
        
                const { uri } = await ImageManipulator.manipulateAsync(
                    result.uri,
                    [{ resize: {width: 800, height: 800}}]
                )
        
                uri && setIdeaImage({uri})
            } else {
                Sentry.captureMessage('no photo permission')
            }
        }catch(ex){
            Sentry.captureException(`pickImage: ${ex}`);
        }

        setLoadingImage(false);
    }

    return (
        <View>
            <TouchableOpacity
                style={styles.btn}
                onPress={pickImage}
            >
                {
                    loadingImage ?
                    <ActivityIndicator color='#A1A1A1' size={44}/>
                    :
                    (
                        !isEmpty(ideaImage) ?
                        <Image source={ideaImage} style={{flex: 1, width: '100%'}}/>
                        :
                        <Icon
                            color='#A1A1A1'
                            name='photo-camera'
                            size={44}
                        />
                    )
                }
            </TouchableOpacity>
            <TextInput
                placeholder='설명 추가'
                style={styles.textInput}
                maxLength={50}
                value={imageTitle}
                onChangeText={setImageTitle}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderWidth: 1,
        borderColor: '#9C9C9C',
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        backgroundColor: 'white',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textInput: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#9C9C9C',
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4,
        padding: 16,
        fontSize: 16,
        backgroundColor: 'white'
    }
});

export default IdeaImageUpload;