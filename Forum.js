import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, RefreshControl, StatusBar, Image } from 'react-native';
import { collection, onSnapshot, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import styled from 'styled-components/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const Container = styled.View`
  flex: 1;
  background-color: #e9ebee;
`;

const Header = styled.View`
  padding: 20px;
  background-color: #4267B2;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  color: #ffffff;
  font-size: 26px;
  font-weight: bold;
`;

const AddButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ForumItem = styled(TouchableOpacity)`
  background-color: #ffffff;
  margin: 10px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  elevation: 2;
  overflow: hidden;
`;

const ForumImage = styled.Image`
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
`;

const ForumTextContainer = styled.View`
  padding: 12px 16px;
`;

const ForumTitle = styled.Text`
  color: #1c1e21;
  font-size: 20px;
  font-weight: bold;
`;

const ForumContent = styled.Text`
  color: #606770;
  margin-top: 4px;
  font-size: 16px;
  line-height: 22px;
`;

const UserInfoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

const UserPhoto = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 8px;
`;

const UserName = styled.Text`
  color: #1c1e21;
  font-size: 16px;
  font-weight: bold;
`;

const PostDate = styled.Text`
  color: #90949c;
  font-size: 14px;
  margin-top: 4px;
`;

const ReactionContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 16px;
`;

const ReactionButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ReactionText = styled.Text`
  font-size: 22px;
  margin-left: 6px;
`;

const CommentButton = styled(ReactionButton)`
  align-self: center;
`;

const ReactionCountText = styled.Text`
  color: #4267B2;
  font-size: 14px;
  font-weight: bold;
`;

export default function Forum({ navigation }) {
  const [forums, setForums] = useState([]);
  const [users, setUsers] = useState({});
  const [reactions, setReactions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  const fetchForums = async () => {
    try {
      const forumRef = collection(db, 'forums');
      const forumQuery = query(forumRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(forumQuery);
      const forumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setForums(forumsData);

      const reactionsData = {};
      snapshot.docs.forEach(doc => {
        const postReactions = doc.data().reactions || {};
        reactionsData[doc.id] = postReactions;
      });
      setReactions(reactionsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados dos fóruns:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();

    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const usersData = {};
      snapshot.forEach(doc => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchForums();
    setRefreshing(false);
  };

  const handleLike = (postId) => {
    const postReactions = reactions[postId] || {};
    postReactions[userId] = 'like';

    const postRef = doc(db, 'forums', postId);
    updateDoc(postRef, { reactions: postReactions })
      .then(() => {
        setReactions(prevReactions => ({
          ...prevReactions,
          [postId]: postReactions,
        }));
      })
      .catch(error => {
        console.error("Erro ao atualizar curtidas:", error);
      });
  };

  const getLikeCount = (postId) => {
    const postReactions = reactions[postId] || {};
    return Object.values(postReactions).filter(reaction => reaction === 'like').length;
  };

  if (loading) {
    return (
      <Container>
        <StatusBar backgroundColor="#4267B2" barStyle="light-content" />
        <Header>
          <HeaderText>Fórum</HeaderText>
          <AddButton onPress={() => navigation.navigate('CreateForum')}>
            <Ionicons name="add-circle" size={28} color="#ffffff" />
          </AddButton>
        </Header>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => (
            <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginVertical: 10 }}>
              <View style={{ width: '100%', height: 180, backgroundColor: '#ddd', borderRadius: 8 }} />
              <View style={{ height: 20, backgroundColor: '#ddd', marginVertical: 10, borderRadius: 4 }} />
              <View style={{ height: 20, backgroundColor: '#ddd', marginVertical: 6, width: '60%', borderRadius: 4 }} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar backgroundColor="#4267B2" barStyle="light-content" />
      <Header>
        <HeaderText>Fórum</HeaderText>
        <AddButton onPress={() => navigation.navigate('CreateForum')}>
          <Ionicons name="add-circle" size={28} color="#ffffff" />
        </AddButton>
      </Header>
      <FlatList
        data={forums}
        renderItem={({ item }) => {
          const postDate = formatDistanceToNow(item.createdAt.toDate(), { locale: ptBR, addSuffix: true });
          const user = users[item.userId] || {};

          return (
            <ForumItem onPress={() => navigation.navigate('ForumDetail', { id: item.id })}>
              {item.imageUrl ? (
                <ForumImage source={{ uri: item.imageUrl }} />
              ) : null}
              <ForumTextContainer>
                <ForumTitle>{item.title}</ForumTitle>
                <ForumContent numberOfLines={3}>{item.content}</ForumContent>
                <UserInfoContainer>
                  <UserPhoto source={{ uri: user.photoURL || 'https://example.com/default-profile.jpg' }} />
                  <UserName>{user.fullName || 'Anonymous'}</UserName>
                </UserInfoContainer>
                <PostDate>{postDate}</PostDate>

                <ReactionContainer>
                  <ReactionButton onPress={() => handleLike(item.id)}>
                    <ReactionText><MaterialIcons name="thumb-up" size={22} color="black" /> Curtir</ReactionText>
                  </ReactionButton>
                  <CommentButton
  onPress={() =>
    navigation.navigate('ForumDetail', { id: item.id, scrollToEnd: true })
  }
>
  <ReactionText>
    <Ionicons name="chatbubble-outline" size={22} color="black" /> Comentários
  </ReactionText>
</CommentButton>



                </ReactionContainer>

                <ReactionCountText>{getLikeCount(item.id)} Curtidas</ReactionCountText>
              </ForumTextContainer>
            </ForumItem>
          );
        }}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </Container>
  );
}
