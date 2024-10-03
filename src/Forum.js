import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc,addDoc} from 'firebase/firestore';
import { db, auth } from './firebase';
import styled from 'styled-components';
import { FaThumbsUp } from 'react-icons/fa'; // Ícone de curtir
import { BiChat } from 'react-icons/bi'; // Ícone de comentários
import { AddCircle } from '@mui/icons-material'; // Ícone de adicionar
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useNavigate } from 'react-router-dom'; // Corrigido para usar react-router-dom



const Container = styled.div`
  flex: 1;
  background-color: #AFAFAF; /* Alterado para um tom de cinza claro */
  display: flex;
  flex-direction: column;
  align-items: center;
  
`;

const Header = styled.header`
  padding: 10px;
  background-color: #343a40; /* Alterado para um cinza escuro */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  border-radius: 10px;
  margin-left: 280px; /* Define a margem esquerda */
`;

const HeaderText = styled.h1`
  color: #ffffff;
  font-size: 36px;
  font-weight: bold;
`;

const AddButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;

const SearchInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
  width: 500px;
  height: 30px
`;

const ForumList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ForumItem = styled.div`
  background-color: #ffffff;
  margin: 16px 0;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  width: 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ForumImage = styled.img`
  width: 80%;
  height: 10%;
  background-color: #e9ecef; /* Cinza claro para imagens sem fundo */
  loading: lazy;
`;

const ForumTextContainer = styled.div`
  padding: 12px 16px;
  width: 90%;
`;

const ForumTitle = styled.h2`
  color: #212529; /* Cinza escuro */
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
`;

const ForumContent = styled.p`
  color: #495057; /* Cinza médio */
  margin-top: 4px;
  font-size: 16px;
  line-height: 22px;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const UserPhoto = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 8px;
`;

const UserName = styled.span`
  color: #212529; /* Cinza escuro */
  font-size: 16px;
  font-weight: bold;
`;

const PostDate = styled.span`
  color: #868e96; /* Cinza claro */
  font-size: 14px;
  margin-top: 4px;
`;

const ReactionContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
  padding: 0 16px;
  width: 100%;
  gap: 100px;
`;

const ReactionButton = styled.button`
  padding: 0px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
`;

const ReactionCountText = styled.span`
  color: #000; /* Preto para contagem de reações */
  font-size: 20px;
  font-weight: bold;
   padding: 0px;
    margin-left: -80px;

`;

const Spinner = styled.div`
  border: 8px solid #e0e0e0; /* Cinza claro */
  border-top: 8px solid #6c757d; /* Cinza médio */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
// Menu lateral
const Sidebar = styled.div`
  width: 250px;
  background-color: #343a40;  // Cor mais escura e suave
  color: white;
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1); // Sombras suaves
`;

const SidebarItem = styled.div`
  margin: 12px 0;
  padding: 15px;
  cursor: pointer;
  background-color: #34495E;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #1ABC9C;  // Cor suave ao passar o mouse
  }
`;
const CommentSection = styled.div`
  width: 90%;
  margin-top: 10px;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
`;

const CommentContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
`;

const CommentUserPhoto = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
`;

const CommentContent = styled.div`
  
`;

const CommentUserName = styled.span`
  font-weight: bold;
  color: #333;
  font-size: 14px;
`;

const CommentText = styled.p`
  color: #555;
  margin: 4px 0;
  font-size: 14px;
`;

const CommentDate = styled.span`
  color: #999;
  font-size: 12px;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  color: #666;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const CommentLikeIcon = styled(FaThumbsUp)`
  margin-right: 6px;
`;

const CommentReplyIcon = styled(BiChat)`
  margin-right: 6px;
`;




export default function Forum() {
  const [forums, setForums] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleContent, setVisibleContent] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({}); // Para novos comentários

  const userId = auth.currentUser?.uid;
  const navigate = useNavigate(); // Use useNavigate para navegação na web

  const fetchForums = () => {
    const forumRef = collection(db, 'forums');
    const forumQuery = query(forumRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(forumQuery, (snapshot) => {
      const forumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setForums(forumsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching forums: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchForums();

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = {};
      snapshot.forEach(doc => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    });

    return () => unsubscribeUsers();
  }, []);

  const handleLike = async (postId) => {
    const postRef = doc(db, 'forums', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const postReactions = postDoc.data().reactions || {};
      const userReaction = postReactions[userId];

      const updatedReactions = { ...postReactions };

      if (userReaction === 'like') {
        delete updatedReactions[userId]; // Remove like se já foi curtido
      } else {
        updatedReactions[userId] = 'like'; // Adiciona ou atualiza a reação
      }

      await updateDoc(postRef, { reactions: updatedReactions });

      setForums((prevForums) =>
        prevForums.map((forum) =>
          forum.id === postId ? { ...forum, reactions: updatedReactions } : forum
        )
      );
    }
  };

  const hasLiked = (postId) => {
    const postReactions = forums.find(forum => forum.id === postId)?.reactions || {};
    return !!postReactions[userId]; // Verifica se o usuário já curtiu
  };

  const getLikeCount = (postId) => {
    const postReactions = forums.find(forum => forum.id === postId)?.reactions || {};
    return Object.keys(postReactions).length;
  };

  // Função para buscar comentários
  const fetchComments = (postId) => {
    const commentsRef = collection(db, 'forums', postId, 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));

    onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments((prev) => ({
        ...prev,
        [postId]: commentsData
      }));
    });
  };

// Alterna a visibilidade dos comentários e busca comentários ao abrir
const toggleCommentsVisibility = (postId) => {
  setVisibleContent(prev => ({
    ...prev,
    [postId]: !prev[postId] // Abre ou fecha somente o post clicado
  }));
  
  if (!visibleContent[postId]) {
    fetchComments(postId); // Busca os comentários apenas se o post está sendo aberto
  }
};


  const handleAddComment = async (postId) => {
    if (newComment[postId]?.trim()) {
      const commentsRef = collection(db, 'forums', postId, 'comments');
      await addDoc(commentsRef, {
        userId: userId,
        content: newComment[postId],
        createdAt: new Date(),
      });
      setNewComment((prev) => ({ ...prev, [postId]: '' })); // Limpa o campo de comentário
    }
  };

  const filteredForums = forums.filter(forum => 
    forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (users[forum.userId]?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderText>Fórum</HeaderText>
          <AddButton onClick={() => navigate('/createforum')}>
            <AddCircle style={{ fontSize: 50, color: '#ffffff' }} />
          </AddButton>
        </Header>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Spinner />
          <p>Carregando...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderText>Fórum</HeaderText>
        <div>
          <SearchInput 
            type="text" 
            placeholder="Buscar por palavras-chave ou usuário" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <AddButton onClick={() => navigate('/createforum')}>
          <AddCircle style={{ fontSize: 50, color: '#ffffff' }} />
        </AddButton>
      </Header>
      <Sidebar>
        <h2>Posts Recentes</h2>
        {forums.map(item => (
          <SidebarItem key={item.id} onClick={() => navigate(`/ForumDetail/${item.id}`)}>
            {item.title}
          </SidebarItem>
        ))}
      </Sidebar>
      <ForumList>
        {filteredForums.map(item => {
          const user = users[item.userId] || {};
          const postDate = formatDistanceToNow(new Date(item.createdAt.seconds * 1000), {
            addSuffix: true,
            locale: ptBR,
          });

          return (
            <ForumItem key={item.id}>
              {item.imageUrl && <ForumImage src={item.imageUrl} alt={item.title} />}
              <ForumTextContainer>
                <ForumTitle onClick={() => toggleCommentsVisibility(item.id)}>{item.title}</ForumTitle>
                {visibleContent[item.id] && <ForumContent>{item.content}</ForumContent>}
                <UserInfoContainer>
                  {user.photoURL ? (
                    <UserPhoto src={user.photoURL} alt={user.fullName} />
                  ) : null}
                  <UserName>{user.fullName || user.firstName}</UserName>
                </UserInfoContainer>
                <PostDate>{postDate}</PostDate>
                <ReactionContainer>
               
<ReactionButton onClick={() => handleLike(item.id)}>
  <FaThumbsUp color={hasLiked(item.id) ? 'blue' : 'gray'} />
</ReactionButton>
<ReactionCountText>{getLikeCount(item.id)}</ReactionCountText>
<ReactionButton onClick={() => toggleCommentsVisibility(item.id)}>
  <BiChat />
</ReactionButton>

</ReactionContainer>
</ForumTextContainer>

{visibleContent[item.id] && (
<div>
{/* Exibe os comentários */}
{comments[item.id]?.map(comment => {
  const commentUser = users[comment.userId] || {};
  const commentDate = formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div key={comment.id} style={{ marginTop: '10px' }}>
      
    </div>
  );
})}
{visibleContent[item.id] && (
  <div>
    {/* Exibe os comentários */}
    {comments[item.id]?.map(comment => {
      const commentUser = users[comment.userId] || {};
      const commentDate = formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), {
        addSuffix: true,
        locale: ptBR,
      });

      return (
        <div key={comment.id} style={{ marginTop: '10px' }}>
                  <CommentContainer>
            {commentUser.photoURL ? (
              <CommentUserPhoto src={commentUser.photoURL} alt={commentUser.fullName} />
            ) : null}
            <CommentContent>
              <CommentUserName>{commentUser.fullName || commentUser.firstName}</CommentUserName>
              <CommentText>{comment.text}</CommentText>
              <CommentDate>{commentDate}</CommentDate>
            </CommentContent>
          </CommentContainer>
        </div>
      );
    })}

    {/* Adicionar novo comentário */}
    <CommentSection>
      <input
        type="text"
        placeholder="Adicionar comentário"
        value={newComment[item.id] || ''}
        onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
      />
      <button onClick={() => handleAddComment(item.id)}>Enviar</button>
    </CommentSection>
  </div>
)}

</div>
)}
</ForumItem>
);
})}
</ForumList>
</Container>
);
}
