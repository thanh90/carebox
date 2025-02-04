import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View, TouchableOpacity, Animated, ActivityIndicator, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';
import { remove, size } from 'lodash';

import TitleNavigationBar from '../../components/TitleNavigationBar';
import { getRegisteredBulletinComments, deleteBulletinComment } from '../../firebase/BulletinRepository';
import BulletinBoardItem from '../../components/BulletinBoardItem';
import BulletinItemDetailModel from '../../modals/BulletinItemDetailModal';
import BulletinBoardComment from '../../components/BulletinBoardComment';

const RegisteredBulletinComments = ({navigation}) => {

    const [items, setItems] = useState([]);
    const [ openBulletinItemDetail, setOpenBulletinItemDetail ] = useState(false);
    const [ currentItem, setCurrentItem ] = useState();

    const [ selectedItemToDelete, setSelectedItemToDelete ] = useState();
    const [ openToast, setOpenToast ] = useState(false);
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const [ toastContent, setToastContent ] = useState('');
    const [ loading, setLoading ] = useState(false);

    const user = useSelector(state => state.user.currentUser);

    useEffect(() => {
        user && getBulletinComments(user.uid);
    }, [user]);

    const getBulletinComments = async (uid) => {
        if(uid){
            const ret = await getRegisteredBulletinComments(uid);
            setItems(ret || []);
        }
    }

    const openItemDetail = (item) => {
        setCurrentItem(item);
        setOpenBulletinItemDetail(true);
    }

    const onDeletePost = async (post) => {
        if(selectedItemToDelete === post.id){
            setLoading(true);
            const ret = await deleteBulletinComment({uid: user.uid, historyBulletinItemId: post.id, bulletinItemId: post.bulletinItemId, commentId: post.commentId});
            setLoading(false);

            if(ret){
                remove(items, item => item.id === post.id);
                setItems([...items]);
            }else{
                setToastContent(`Something's wrong. Please try again`);
                setOpenToast(true);
            }
        }else{
            setToastContent('한 번 더 버튼을 눌러 삭제하세요');
            setSelectedItemToDelete(post.id);
            setOpenToast(true);
        }
    }

    useEffect(() => {
        if(openToast){
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
                delay: 2000
            }).start(() => setOpenToast(false));
        }
    }, [openToast]);

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{backgroundColor: 'white', paddingHorizontal: 20, alignItems: 'center'}}>
                <TitleNavigationBar
                    title='내가 쓴 댓글'
                    containerStyle={{paddingVertical: 8}}
                    onBackPress={() => navigation.pop()}
                />
            </View>

            {
                !size(items) ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('assets/icons/post_border.png')} style={{width: 84, height: 84}}/>             
                    <Text style={{textAlign: 'center', color: '#334F74', fontSize: 16, marginTop: 24}}>아직 쓴 댓글이 없습니다</Text>
                </View>
                :
                <FlatList
                    style={{width: '100%'}}
                    data={items}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => openItemDetail(item)}
                            style={{marginTop: 20, marginHorizontal: 20}}
                        >
                            <BulletinBoardComment item={item}/>
                            <TouchableOpacity
                                style={{position: 'absolute', top: 0, right: 0, paddingVertical: 20, paddingHorizontal: 20}}
                                onPress={() => onDeletePost(item)}
                                disabled={loading}
                            >
                                {
                                    (loading && selectedItemToDelete === item.id) ?
                                    <ActivityIndicator size='small' color='#787878' />
                                    :
                                    <Icon name='delete' color={selectedItemToDelete === item.id ? '#1379FF' : '#787878'} />
                                }
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={<View style={{height: 100}} />}
                />
            }
            {
                openBulletinItemDetail &&
                <BulletinItemDetailModel
                    isVisible={openBulletinItemDetail}
                    item={currentItem}
                    onClose={() => setOpenBulletinItemDetail(false)}
                />
            }
            {
                openToast &&
                <Animated.View
                    style={{
                        opacity: opacityAnim,
                        position: 'absolute',
                        bottom: 0, right: 0, left: 0,
                        backgroundColor: '#333',
                        paddingVertical: 8
                    }}
                >
                    <Text style={{textAlign: 'center', color: 'white'}}>{toastContent}</Text>
                </Animated.View>
            }
        </SafeAreaView>
    )
}

export default RegisteredBulletinComments;