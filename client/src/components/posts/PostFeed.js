import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PostItem from './PostItem';

class PostFeed extends Component {
    render() {
        const { posts } = this.props.posts;

        return (
            posts.map(post => <PostItem key={post._id} post={post} />)
        )
    }
}

PostFeed.propTypes = {
    posts: PropTypes.object.isRequired
}

export default PostFeed;
