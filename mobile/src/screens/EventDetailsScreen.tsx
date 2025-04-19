import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { RootStackParamList, Event, Comment } from '../types';
import { EventApi, CommentApi } from '../services/api';
import CommentItem from '../components/CommentItem';
import { COLORS, SPACING, FONT } from '../utils/theme';

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type EventDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

const EventDetailsScreen = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const { eventId } = route.params;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  
  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await EventApi.getEventById(eventId);
      setEvent(eventData);
      
      // Set the header title
      if (eventData) {
        navigation.setOptions({
          title: eventData.title,
        });
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await CommentApi.getCommentsByEventId(eventId);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle upvote
  const handleUpvote = async () => {
    if (!event) return;
    try {
      const updatedEvent = await EventApi.toggleUpvote(eventId, event.userVote);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };
  
  // Handle downvote
  const handleDownvote = async () => {
    if (!event) return;
    try {
      const updatedEvent = await EventApi.toggleDownvote(eventId, event.userVote);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Failed to downvote:', error);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!event) return;
    try {
      const updatedEvent = await EventApi.toggleSaved(eventId);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };
  
  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      const newComment = await CommentApi.addComment(eventId, commentText);
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Handle comment upvote
  const handleCommentUpvote = async (commentId: string, currentVote: 'up' | 'down' | null) => {
    // In a real app, this would call the API to update the vote
    // For now we'll just update the state locally
    setComments(comments.map(comment => {
      if (comment.id !== commentId) return comment;
      
      const updatedComment = { ...comment };
      
      if (currentVote === 'up') {
        updatedComment.upvotes--;
        updatedComment.userVote = null;
      } else if (currentVote === 'down') {
        updatedComment.downvotes--;
        updatedComment.upvotes++;
        updatedComment.userVote = 'up';
      } else {
        updatedComment.upvotes++;
        updatedComment.userVote = 'up';
      }
      
      return updatedComment;
    }));
  };
  
  // Handle comment downvote
  const handleCommentDownvote = async (commentId: string, currentVote: 'up' | 'down' | null) => {
    // In a real app, this would call the API to update the vote
    // For now we'll just update the state locally
    setComments(comments.map(comment => {
      if (comment.id !== commentId) return comment;
      
      const updatedComment = { ...comment };
      
      if (currentVote === 'down') {
        updatedComment.downvotes--;
        updatedComment.userVote = null;
      } else if (currentVote === 'up') {
        updatedComment.upvotes--;
        updatedComment.downvotes++;
        updatedComment.userVote = 'down';
      } else {
        updatedComment.downvotes++;
        updatedComment.userVote = 'down';
      }
      
      return updatedComment;
    }));
  };
  
  // Navigate to QR wristband screen
  const handleGetWristband = () => {
    navigation.navigate('QRWristband', { eventId });
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  useEffect(() => {
    fetchEventDetails();
    fetchComments();
  }, [eventId]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Event Image */}
        {event.imageUrl && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: event.imageUrl }} 
              style={styles.image} 
              resizeMode="cover" 
            />
            {event.isPrivate && (
              <View style={styles.privateBadge}>
                <Icon name="lock-closed" size={12} color="#FFF" />
                <Text style={styles.privateBadgeText}>Private Event</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          {/* Event Header */}
          <View style={styles.headerContainer}>
            <View style={styles.organizerContainer}>
              <Image 
                source={{ uri: event.organizerImageUrl }} 
                style={styles.organizerImage} 
              />
              <Text style={styles.organizerName}>{event.organizerName}</Text>
            </View>
            
            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.detailRow}>
              <Icon name="calendar" size={18} color={COLORS.secondaryText} />
              <Text style={styles.detailText}>{formatDate(event.dateTime)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="location" size={18} color={COLORS.secondaryText} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
            
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{event.category}</Text>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <View style={styles.votesContainer}>
              <TouchableOpacity 
                style={styles.voteButton} 
                onPress={handleUpvote}
              >
                <Icon 
                  name={event.userVote === 'up' ? 'arrow-up-circle' : 'arrow-up-circle-outline'} 
                  size={28} 
                  color={event.userVote === 'up' ? COLORS.primary : COLORS.secondaryText} 
                />
                <Text 
                  style={[
                    styles.voteCount, 
                    event.userVote === 'up' && styles.activeVoteCount
                  ]}
                >
                  {event.upvotes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.voteButton} 
                onPress={handleDownvote}
              >
                <Icon 
                  name={event.userVote === 'down' ? 'arrow-down-circle' : 'arrow-down-circle-outline'} 
                  size={28} 
                  color={event.userVote === 'down' ? COLORS.error : COLORS.secondaryText} 
                />
                <Text 
                  style={[
                    styles.voteCount, 
                    event.userVote === 'down' && styles.errorVoteCount
                  ]}
                >
                  {event.downvotes}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSave}
              >
                <Icon 
                  name={event.saved ? 'bookmark' : 'bookmark-outline'} 
                  size={24} 
                  color={event.saved ? COLORS.primary : COLORS.secondaryText} 
                />
                <Text 
                  style={[
                    styles.actionText, 
                    event.saved && styles.activeActionText
                  ]}
                >
                  {event.saved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {}} // In a real app, this would share the event
              >
                <Icon name="share-social-outline" size={24} color={COLORS.secondaryText} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              {event.isPrivate && (
                <TouchableOpacity 
                  style={styles.wristbandButton} 
                  onPress={handleGetWristband}
                >
                  <Icon name="qr-code" size={20} color="#FFF" />
                  <Text style={styles.wristbandButtonText}>Get Wristband</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Comments */}
          <View style={styles.commentsContainer}>
            <Text style={styles.sectionTitle}>Comments</Text>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!commentText.trim() || submittingComment) && styles.disabledButton
                ]} 
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Icon name="send" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
            
            {loadingComments ? (
              <ActivityIndicator style={styles.commentsLoading} size="small" color={COLORS.primary} />
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onUpvote={handleCommentUpvote}
                  onDownvote={handleCommentDownvote}
                />
              ))
            ) : (
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT.sizes.l,
    color: COLORS.error,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
  },
  privateBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
  },
  privateBadgeText: {
    color: '#FFF',
    fontSize: FONT.sizes.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentContainer: {
    padding: SPACING.l,
  },
  headerContainer: {
    marginBottom: SPACING.l,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  organizerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.xs,
  },
  organizerName: {
    fontSize: FONT.sizes.s,
    fontWeight: '500',
    color: COLORS.secondaryText,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.s,
  },
  category: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT.sizes.l,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  description: {
    fontSize: FONT.sizes.m,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionsContainer: {
    marginBottom: SPACING.l,
    paddingBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  votesContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.l,
  },
  voteCount: {
    fontSize: FONT.sizes.m,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  activeVoteCount: {
    color: COLORS.primary,
  },
  errorVoteCount: {
    color: COLORS.error,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.l,
    marginBottom: SPACING.s,
  },
  actionText: {
    fontSize: FONT.sizes.s,
    color: COLORS.secondaryText,
    marginLeft: SPACING.xs,
  },
  activeActionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  wristbandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  wristbandButtonText: {
    fontSize: FONT.sizes.s,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: SPACING.xs,
  },
  commentsContainer: {
    marginBottom: SPACING.l,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: SPACING.m,
    fontSize: FONT.sizes.s,
    backgroundColor: COLORS.card,
    maxHeight: 100,
  },
  submitButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
    alignSelf: 'flex-end',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  commentsLoading: {
    marginVertical: SPACING.l,
  },
  noCommentsText: {
    textAlign: 'center',
    color: COLORS.secondaryText,
    fontSize: FONT.sizes.s,
    marginVertical: SPACING.l,
  },
});

export default EventDetailsScreen; 