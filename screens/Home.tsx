import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, ScrollView, Text, View, TouchableOpacity, FlatList, Platform, AppState } from 'react-native';
import { Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { size, isEmpty, filter, find, throttle, includes } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { UpdateEventType } from 'expo-updates';
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';

import PickedIdeaListHeader from 'components/PickedIdeaListHeader';
import Filter from 'components/Filter';
import PickedIdea from 'components/Idea/PickedIdea';
import NewIdea from 'components/Idea/NewIdea';
import IdeaRegistrationModal from 'modals/IdeaRegistrationModal';
import { addIdeasListenner } from 'firebase/IdeaRepository';
import { requestPushNotificationPermission, subscribeForUserInformation, subscribeForNotifications, markReadingNotification, subscribeForPublicNotifications } from '../firebase/UserRepository';
import { Icon } from 'react-native-elements';
import InfoModal from '../modals/InfoModal';
import CBButton from '../components/CBButton';
import { acceptPicking, getPickedIdeas, rejectPicking } from '../firebase/IdeaRepository';
import RoundButton from '../components/RoundButton';
import BannerModal from '../modals/BannerModal';

export default function Home({navigation}) {

  const currentUser = useSelector(state => state.user.currentUser);
  const storeIdeas = useSelector(state => state.user.ideas);
  const notifications = useSelector(state => state.user.userNotifications);
  const unreadNotificationCount = size(filter(notifications, notification => notification.unRead));

  const publicNotifications = useSelector(state => state.user.publicNotifications);

  const dispatch = useDispatch();

  const [ ideas, setIdeas ] = useState(storeIdeas);
  const [ currentFilter, setCurrentFilter ] = useState('전체');
  const [ openRegistrationModal, setOpenRegistrationModal ] = useState(false);

  const [ openModalToAllowPick, setOpenModalToAllowPick ] = useState(false);
  const [ askForPickNotification, setAskForPickNotification ] = useState({});

  const [ pickedIdeaIds, setPickedIdeaIds ] = useState([]);

  const [ openPickRequestAccepted, setOpenPickRequestAccepted ] = useState(false);
  const [ pickAcceptedNotification, setPickAcceptedNotification ] = useState({});

  const [ loading, setLoading ] = useState(false);

  const appState = useRef(AppState.currentState);
  const [ hasNewExpoUpdate, setHasNewExpoUpdate ] = useState(false);

  const [ openBanner, setOpenBanner ] = useState(false);

  const openModal = () => setOpenRegistrationModal(true)
  const closeModal = () => setOpenRegistrationModal(false)

  useEffect(() => {
    if(!__DEV__){
      AppState.addEventListener("change", _handleAppStateChange);
    }

    requestAppTracking();
    requestPushNotificationPermission();

    const unsubscriber = addIdeasListenner(dispatch);

    return () => {
      (typeof unsubscriber === 'function') && unsubscriber();
      !__DEV__ && AppState.removeEventListener("change", _handleAppStateChange);
    }
  }, []);

  const requestAppTracking = async() => {
    if(Platform.OS === 'ios'){
      const trackingStatus = await getTrackingStatus();
      if (trackingStatus === 'not-determined') {
          await requestTrackingPermission();
      }
    }
  }

  const _handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      hasNewExpoUpdate ? (await Updates.reloadAsync()) : expoUpdateListenner();
    }

    appState.current = nextAppState;
    console.log("AppState", appState.current);
  };

  const expoUpdateListenner = async() => {
    try{
      const ret = await Updates.checkForUpdateAsync();
      if(ret.isAvailable){
        await Updates.fetchUpdateAsync();
        setHasNewExpoUpdate(true);
      }
    }catch(ex){
      Sentry.captureException(`expoUpdateListenner: ${ex}`);
    }
  }

  useEffect(() => {
    const notification = find(notifications, notification => notification.unRead && notification.type==='ASKED_FOR_PICK');
    if(notification){
      setAskForPickNotification(notification);
      setOpenModalToAllowPick(true);
    }

    const acceptedNotification = find(notifications, notification => notification.unRead && notification.type==='ACCEPTED_TO_PICK');
    if(acceptedNotification){
      setPickAcceptedNotification(acceptedNotification);
      setOpenPickRequestAccepted(true);
    }
  }, [notifications]);

  useEffect(() => {
    if(!currentFilter) return;

    console.log('currentFilter', currentFilter);

    if(currentFilter === '전체'){
      setIdeas(storeIdeas);
    } else {
      setIdeas(filter(storeIdeas, idea => idea.category === currentFilter));
    }

  }, [currentFilter, storeIdeas]);

  useEffect(() => {
    if(currentUser){
      initUserData();
    }
  }, [currentUser]);

  const initUserData = async () => {
    subscribeForUserData(currentUser);
    setPickedIdeaIds(await getPickedIdeas(currentUser.uid))
  }

  const subscribeForUserData = async (user) => {
    console.log('subscribeForUserData', user);
    if(user){
      const uid = user.uid;
      if(uid){
        const userDataUnsubscriber = await subscribeForUserInformation(uid, dispatch);
        const userNotificationsUnsubscriber = await subscribeForNotifications(uid, dispatch);
        const publicNotificationsUnsubscriber = await subscribeForPublicNotifications(dispatch);

        return () => {
          (typeof userDataUnsubscriber === 'function') && userDataUnsubscriber();
          (typeof userNotificationsUnsubscriber === 'function') && userNotificationsUnsubscriber();
          (typeof publicNotificationsUnsubscriber === 'function') && publicNotificationsUnsubscriber();
        }
      }
    }
  }

  const acceptPick = async() => {
    setLoading(true);
    try{
      const {id, ideaId, comment} = askForPickNotification;
      if(!ideaId || !comment){
        return;
      }
      await acceptPicking({uid: currentUser.uid, ideaId , commentId: comment.id, notificationId: id});
    }catch(ex){
      Sentry.captureException(`acceptPicking: ${ex}`);
    }
    setLoading(false);
    setOpenModalToAllowPick(null);
  }

  const rejectPick = async() => {
    setLoading(true);
    try{
      const {id, ideaId, comment} = askForPickNotification;
      if(!ideaId || !comment){
        return;
      }
      await rejectPicking({uid: currentUser.uid, ideaId , commentId: comment.id, notificationId: id});
    }catch(ex){
      Sentry.captureException(`rejectPicking: ${ex}`);
    }
    setLoading(false);
    setOpenModalToAllowPick(null);
  }

  const readNotification = async ({uid, notificationId, ideaId}) => {
    setLoading(true);
    try{
      await markReadingNotification({uid, notificationId});
      setOpenPickRequestAccepted(false);
      if(ideaId){
        navigation.navigate('Idea', {ideaId: ideaId})
      }
    }catch(ex){
      Sentry.captureException(`readNotification: ${ex}`);
    }
    setLoading(false);
  }

  const pickedIdea = find(ideas, idea => includes(pickedIdeaIds, idea.id));

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <Image
          style={{marginVertical: 16, alignSelf: 'center', height: 24}}
          source={require('assets/images/carebox.png')}
          resizeMode='contain'
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 0, top: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20
          }}
          onPress={() => navigation.navigate('Notification')}
        >
          <>
          <Icon
            name='notifications-none'
          />
          {
            unreadNotificationCount > 0 ?
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'red',
                width: 20,
                height: 20,
                borderRadius: 20,
                justifyContent: 'center'
              }}
            >
              <Text style={{fontWeight: '900', color: 'white', textAlign: 'center'}}>{unreadNotificationCount}</Text>
            </View>
            :
            (
              size(publicNotifications) > 0 &&
              <View
                style={{
                  position: 'absolute',
                  bottom: 18,
                  right: 20,
                  backgroundColor: 'red',
                  width: 8,
                  height: 8,
                  borderRadius: 8,
                }}
              />
            )
          }
          </>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{width: '100%'}}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#1379FF',
            height: 100, width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setOpenBanner(true)}
        >
          <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>
            간호 혁신 아이디어에 도전하세요!
          </Text>
        </TouchableOpacity>
        <View style={{backgroundColor: 'white', padding: 20, borderBottomColor: '#eee', borderBottomWidth: 1}}>
          <Filter value={currentFilter} setValue={setCurrentFilter}/>
        </View>
        <View style={{paddingHorizontal: 20, marginBottom: 80}}>
          {
            !isEmpty(pickedIdea) &&
            <>
              <PickedIdeaListHeader
                containerStyle={{paddingVertical: 20}}
                onPress={() => navigation.navigate('PickedIdeas', {ids: pickedIdeaIds})}
              />
              <PickedIdea idea={pickedIdea}/>
              <Divider style={{marginTop: 20}} />
            </>
          }
          <View style={{marginTop: 20}}>
            <Text style={{fontSize: 24, color: '#1D395F', marginBottom: 20}}>New Idea</Text>

            <FlatList
              data={filter(ideas, idea => !includes(pickedIdeaIds, idea.id))}
              // data={[]}
              keyExtractor={item => item.id}
              renderItem={
                ({item}) => (
                  <TouchableOpacity
                    style={{marginBottom: 20}}
                    onPress={() => navigation.navigate('Idea', {idea: item})}
                  >
                    <NewIdea idea={item} />
                  </TouchableOpacity>
                )
              }
              ListEmptyComponent={() => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60}}>
                <Image source={require('assets/icons/idea_border.png')} style={{width: 84, height: 84}}/>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#334F74',
                    fontSize: 16,
                    marginTop: 24
                  }}
                >
                  {`등록된 아이디어가 없습니다.\n지금 아이디어를 등록해보세요!`}
                </Text>
              </View>}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={{position: 'absolute', bottom: 10, width: '60%'}}>
          <RoundButton
              text='아이디어 등록하기'
              onPress={throttle(openModal, 2000, {trailing: false})}
          />
      </View>
      {
        openRegistrationModal &&
        <IdeaRegistrationModal onClose={closeModal}/>
      }
      {
        Boolean(openModalToAllowPick) &&
        <InfoModal isVisible={Boolean(openModalToAllowPick)} onClose={() => setOpenModalToAllowPick(null)}>
          <Text style={{fontSize: 24, color: '#1D395F', marginBottom: 24}}>
              Pick 초대
          </Text>
          <Text style={{textAlign: 'center', color: '#001240', lineHeight: 24}}>
              {`‘${askForPickNotification.ideaOwner.nickName}님’이 회원님을\n아이디어 참여자로 pick했어요!`}
          </Text>
          <TouchableOpacity style={{marginBottom: 24, padding: 8}}>
              <Text style={{fontSize: 12, color: '#4A7CFF'}}>아이디어 상세 보기 ></Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row'}}>
              {
                loading ?
                <CBButton
                  variant='contained'
                  loading={loading}
                  containerStyle={{
                    paddingVertical: 16,
                    width: '100%',
                    borderRadius: 50
                  }}
                />
                :
                <>
                  <CBButton
                      text='거절'
                      variant='outlined'
                      loading={loading}
                      containerStyle={{
                        paddingVertical: 16,
                        paddingHorizontal: 32,
                        marginRight: 16,
                        borderRadius: 50
                      }}
                      onPress={throttle(rejectPick, 10000, {trailing: false})}
                  />
                  <CBButton
                      text='수락'
                      variant='contained'
                      containerStyle={{
                        paddingVertical: 16,
                        paddingHorizontal: 32,
                        borderRadius: 50
                      }}
                      loading={loading}
                      onPress={throttle(acceptPick, 10000, {trailing: false})}
                  />
                </>
              }
          </View>
        </InfoModal>
      }
      {
        Boolean(openPickRequestAccepted) &&
        <InfoModal isVisible={Boolean(openPickRequestAccepted)} onClose={() => setOpenPickRequestAccepted(null)}>
          <Text style={{fontSize: 24, color: '#1D395F', marginBottom: 24}}>
            Pick하기
          </Text>
          <Text style={{textAlign: 'center', color: '#001240', lineHeight: 24}}>
              {`‘${pickAcceptedNotification.commentOwner.nickName}님’이 회원님의 pick을 수락했어요!`}
          </Text>
          <TouchableOpacity
            style={{marginBottom: 24, padding: 8}}
            onPress={() => readNotification({uid: currentUser.uid, notificationId: pickAcceptedNotification.id, ideaId: pickAcceptedNotification.ideaId})}
          >
              <Text style={{fontSize: 12, color: '#4A7CFF'}}>아이디어 상세 보기 ></Text>
          </TouchableOpacity>
          <CBButton
              text='확인'
              variant='contained'
              loading={loading}
              containerStyle={{width: '100%', paddingVertical: 16, borderRadius: 50, alignItems: 'center'}}
              onPress={() => readNotification({uid: currentUser.uid, notificationId: pickAcceptedNotification.id})}
          />
        </InfoModal>
      }
      {
        openBanner &&
        <BannerModal
          onClose={() => setOpenBanner(false)}
        />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF4F5',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
