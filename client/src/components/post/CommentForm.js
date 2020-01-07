import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { addComment } from '../../actions/postAction';

import TextAreaFieldGroup from '../common/TextAreaFieldGroup';

class CommentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            errors: {}
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors })
        } else {
            this.setState({ errors: {} })
        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }
    onSubmit(e) {
        e.preventDefault();
        const { user } = this.props.auth;
        const { postId } = this.props;
        const newComment = {
            text: this.state.text,
            user: user.name,
            avatar: user.avatar
        }
        this.props.addComment(postId, newComment)
        this.setState({ text: '' })
    }
    render() {
        const { errors } = this.state;
        return (
            <div className="post-form mb-3">
                <div className="card card-info">
                    <div className="card-header bg-info text-white">
                        Add some comment...
                    </div>
                    <div className="card-body">
                        <form onSubmit={this.onSubmit}>
                            <div className="from-group">
                                <TextAreaFieldGroup
                                    error={errors.text}
                                    value={this.state.text}
                                    placeholder="Add a comment"
                                    name="text"
                                    onChange={this.onChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-dark">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

CommentForm.propTypes = {
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    addComment: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
})

export default connect(mapStateToProps, { addComment })(CommentForm);
