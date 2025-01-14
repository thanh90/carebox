import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert, TextInput, ScrollView, Linking } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { size, throttle, trim } from 'lodash';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native-paper';
import { login, requestForVerificationCode, verifyLoginCode } from '../../firebase/UserRepository';

const PhoneNumberVerification = ({onSuccess}) => {
    const [ step, setStep ] = useState(1);
    const [ phoneNumber, setPhoneNumber ] = useState();
    const [ verificationId, setVerificationId ] = useState();
    const [ isNewUser, setIsNewUser ] = useState();
    const [ timeCountDown, setTimeCountDown ] = useState(180);
    const [ timeCountDownText, setTimeCountDownText ] = useState('03:00');

    const [ loading, setLoading ] = useState(false);
    const [ verificationCode, setVerificationCode ] = useState();
    const [ isTextOnFocus, setTextOnFocus ] = useState(false);
    const [ isPolicyAgreed, setPolicyAgreed ] = useState(false);
    const [ showCodeReissueButton, setShowCodeReissueButton ] = useState(false);

    useEffect(() => {
        if(step === 2){
            const interval = setInterval(() => timeCountDown > 0 && setTimeCountDown(timeCountDown => timeCountDown - 1), 1000);
    
            return () => clearInterval(interval);
        }
    }, [step]);

    useEffect(() => {
        if(timeCountDown < 120){
            setShowCodeReissueButton(true);
        }

        const minutes = ('0' + ((timeCountDown / 60) | 0)).slice(-2);
        const seconds = ('0' + timeCountDown % 60).slice(-2);

        setTimeCountDownText(`${minutes}:${seconds}`);
    }, [timeCountDown]);

    async function signInWithPhoneNumber() {
        setLoading(true);

        try{
            const number = phoneNumber.replace('0', '+82');

            const data = await requestForVerificationCode(number);
            if(data){
                const {userStatus, verificationId} = data;
                if(userStatus && verificationId){
                    setStep(2);
                    setIsNewUser(userStatus==='NOT_EXIST_USER');
                    setVerificationId(verificationId);
                }
            }

        }catch(ex){
            Sentry.captureException(`signInWithPhoneNumber-${ex}`);
        }

        setLoading(false);
    }

    const confirmCode = async () => {
        setLoading(true);
        setShowCodeReissueButton(false);

        const trimCode = trim(verificationCode);
        if(trimCode.length !== 6){
            setLoading(false);
            Alert.alert('인증번호가 6자리 까지 이에요.');
            return;
        }

        try{
            const {status, uid, authToken, code} = await verifyLoginCode({verificationCode: trimCode, verificationId})
            console.log(status, uid, authToken);

            if(status === 'OK'){
                await onSuccess({isNewUser, phoneNumber, uid, authToken});
            } else {
                Alert.alert('인증번호가 잘못되었습니다. 다시 시도해 주세요');
                setShowCodeReissueButton(true);
            }

        }catch(ex){
            Sentry.captureException(`confirmCode-${ex}`);
            Alert.alert('인증번호가 잘못되었습니다. 다시 시도해 주세요');
            setShowCodeReissueButton(true);
        }

        setLoading(false);
    }

    return (
        <View style={{flex: 1, width: '100%', padding: 24, marginTop: 60}}>
            {
                step===2 &&
                <View
                    style={{position: 'absolute', top: -32, left: 16}}
                >
                    <TouchableOpacity
                        style={{padding: 8}}
                        onPress={() => setStep(1)}
                    >
                        <Icon
                            name='arrow-back-ios'
                            color='#666'
                        />
                    </TouchableOpacity>
                </View>
            }

            <ScrollView
                style={{
                    flexDirection: 'column',
                    flex: 1,
                }}
            >
                <Text style={{fontSize: 28, fontWeight: 'bold', color: '#001240', marginBottom: 48,}}>
                    {`안녕하세요!\n케어박스입니다.`}
                </Text>
                {
                    step === 1 &&
                    <>
                        <Text style={{fontSize: 20, color: '#434A3F', marginBottom: 12}}>휴대폰 번호로 가입해주세요</Text>

                        <TextInput
                            style={{
                                fontSize: 18,
                                backgroundColor: '#F1F1F1',
                                paddingVertical: 16,
                                alignSelf: 'flex-start',
                                alignItems: 'center',
                                width: '100%'
                            }}
                            keyboardType='numeric'
                            textAlign='center'
                            placeholder='-를 제외하고 입력해 주세요'
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            maxLength={11}
                            onFocus={() => setTextOnFocus(true)}
                            onBlur={() => setTextOnFocus(false)}
                        />

                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                <Text
                                    style={{color: '#434A3F', fontSize: 12, textDecorationLine: 'underline'}}
                                    onPress={() => Linking.openURL('https://docs.google.com/document/d/1FmijOedXk1TOUkgy39xL_714zeG4mXBIHhQuI9nZS20')}
                                >
                                    사이트 이용약관
                                </Text>
                                <Text style={{color: '#434A3F', fontSize: 12}}> 및 </Text>
                                <Text
                                    style={{color: '#434A3F', fontSize: 12, textDecorationLine: 'underline'}}
                                    onPress={() => Linking.openURL('https://docs.google.com/document/d/1imMytH_puooCflrw1Ln9kuSMaVYw8Pi7PVdyOw7lA-E')}
                                >
                                    개인정보 수집 동의
                                </Text>
                            </View>
                            <CheckBox
                                center
                                iconRight
                                title=''
                                textStyle={{
                                    textDecorationLine: 'underline',
                                    fontSize: 12,
                                    color: '#979797',
                                    fontWeight: 'normal'
                                }}
                                containerStyle={{
                                    backgroundColor: 'white',
                                    borderWidth: 0
                                }}
                                checked={isPolicyAgreed}
                                onPress={() => setPolicyAgreed(!isPolicyAgreed)}
                            />
                        </View>
                    </>
                }

                {
                    step === 2 &&
                    <>
                        <Text style={{fontSize: 20, color: '#434A3F', marginBottom: 12}}>
                            인증번호를 입력해 주세요
                        </Text>

                        <TextInput
                            style={{
                                fontSize: 18,
                                backgroundColor: '#F1F1F1',
                                paddingVertical: 16,
                                alignSelf: 'flex-start',
                                alignItems: 'center',
                                width: '100%'
                            }}
                            keyboardType='numeric'
                            textAlign='center'
                            placeholder='• • • • • •'
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            onFocus={() => setTextOnFocus(true)}
                            onBlur={() => setTextOnFocus(false)}
                            autoFocus
                            maxLength={6}
                        />

                        <Text style={{textAlign: 'center', marginTop: 8, color: 'red'}}>{timeCountDownText}</Text>

                        {
                            showCodeReissueButton &&
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 24
                                }}
                            >
                                <Text style={{marginRight: 16}}>
                                    인증번호가 오지 않았나요?
                                </Text>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                    disabled={loading}
                                    onPress={throttle(() => {
                                        signInWithPhoneNumber();
                                        setVerificationCode();
                                        setTimeCountDown(180);
                                    }, 10000, {trailing: false})}
                                >
                                    <Icon
                                        type='material'
                                        name='refresh'
                                        size={14}
                                    />
                                    <Text>재발송하기</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </>
                }

            </ScrollView>

            {
                !isTextOnFocus &&
                <TouchableOpacity
                    style={{
                        backgroundColor: '#4A7CFF',
                        paddingVertical: 16,
                        borderRadius: 50,
                        width: '100%',
                        opacity: isPolicyAgreed ? 1 : 0.5
                    }}
                    disabled={(step===1&&size(phoneNumber)!==11) || loading || !isPolicyAgreed}
                    onPress={throttle(step===1?signInWithPhoneNumber:confirmCode, 10000,  { trailing: false})}
                >
                    {
                        loading ?
                        <ActivityIndicator size='small' color='white' />
                        :
                        <Text style={{fontWeight: 'bold', fontSize: 25, color: 'white', textAlign: 'center'}}>
                            다음
                        </Text>
                    }
                </TouchableOpacity>
            }
        </View>
    )
}

export default PhoneNumberVerification;