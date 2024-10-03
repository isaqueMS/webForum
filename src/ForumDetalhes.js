import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  ScrollView,
} from 'react-native';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const formatContent = (text) => {
  let formattedText = text.replace(/(?:\r\n|\r|\n){2,}/g, '\n\n');
  formattedText = formattedText.replace(/(\.)(\s|$)/g, '$1\n');
  return formattedText;
};

const ForumContent = ({ forum }) => (
  <View style={styles.forumContentContainer}>
    <Text style={styles.forumTitle}>{forum.title}</Text>
    <Text style={styles.forumContent}>{formatContent(forum.content)}</Text>
    {forum.imageUrl && <Image source={{ uri: forum.imageUrl }} style={styles.forumImage} />}
  </View>
);

const CommentList = ({ comments, users }) => {
  const sortedComments = comments.slice().sort((a, b) => {
    const aDate = a.createdAt?.toDate() || new Date();
    const bDate = b.createdAt?.toDate() || new Date();
    return aDate - bDate;
  });

  return (
    <>
      {sortedComments.map((item) => {
        const user = users[item.userId] || {};
        const commentDate = item.createdAt?.toDate()
          ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: ptBR })
          : 'Desconhecido';

        return (
          <View key={item.id} style={styles.commentItem}>
            <Image
              source={{ uri: user.photoURL || 'https://example.com/default-profile.jpg' }}
              style={styles.userPhoto}
            />
            <View style={styles.commentContent}>
              <Text style={styles.userName}>{user.fullName || 'Anonymous'}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <Text style={styles.commentDate}>{commentDate}</Text>
            </View>
          </View>
        );
      })}
    </>
  );
};

const CommentInput = React.forwardRef(({ value, onChangeText, onSubmitEditing }, ref) => (
  <View style={styles.commentInputContainer}>
    <TextInput
      ref={ref}
      placeholder="Adicionar um comentário"
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#666666"
      style={styles.commentInput}
      onSubmitEditing={onSubmitEditing}
    />
    <Button title="Enviar" onPress={onSubmitEditing} />
  </View>
));

const ForumDetalhes = () => {
  const { id } = useParams(); // Obtém o parâmetro 'id' da URL
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [users, setUsers] = useState({});
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchForum = async () => {
      const docSnap = await getDoc(doc(db, 'forums', id));
      if (docSnap.exists()) {
        setForum(docSnap.data());
      }
    };

    const fetchComments = () => {
      const unsubscribe = onSnapshot(collection(db, 'forums', id, 'comments'), snapshot => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });

      return unsubscribe;
    };

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = {};
      usersSnapshot.forEach(doc => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    };

    fetchForum();
    fetchComments();
    fetchUsers();
  }, [id]);

  const handleAddComment = async () => {
    if (comment.trim()) {
      await addDoc(collection(db, 'forums', id, 'comments'), {
        text: comment,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      });
      setComment('');
      inputRef.current?.blur();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.innerContainer}>
        {forum && (
          <>
            <ForumContent forum={forum} />
            <CommentList comments={comments} users={users} />
            <CommentInput
              ref={inputRef}
              value={comment}
              onChangeText={setComment}
              onSubmitEditing={handleAddComment}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  innerContainer: {
    flexGrow: 1,
  },
  forumContentContainer: {
    flex: 1,
    marginBottom: 16,
  },
  forumTitle: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  forumContent: {
    color: '#666666',
    fontSize: 18,
    lineHeight: 30,
    marginBottom: 16,
  },
  forumImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  commentItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20, // Ajustado para ficar correto
  },
  userName: {
    color: '#333333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
  },
  commentDate: {
    color: '#999999',
    fontSize: 12,
  },
  commentInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    color: '#333333',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
};

export default ForumDetalhes;
