'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import defaultValidations from '../constants/defaultValidations'
import classNames from 'classnames';
import FormActions from '../actions/FormActions';
import {getInput} from '../utilities';

// TODO: Show message text as an array of validation messages
// TextArea should also accept a validation regex key

const mapStateToProps = (state) => {
	return {
		'forms': state.forms
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		'addInput': FormActions.addInput,
		'removeInput': FormActions.removeInput
	}, dispatch)
};

class TextArea extends React.Component {
	constructor() {
        super();

        this.state = {
			'name': null,
			'value': null,
			'formName': null,
			'valid': true,
			'initial': true,
			'touched': false,
			'pristine': true,
			'focused': false,
			'blurred': false
        };

		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.validateInit = this.validateInit.bind(this);
		this.validateInput = this.validateInput.bind(this);
    }

	componentDidMount() {
		this.validateInit(this.props);
	}

	// Accounts for initial data check and conditionally required inputs
	componentWillReceiveProps(nextProps) {
		if (this.state.initial && this.state.pristine && nextProps.value || this.props.required !== nextProps.required) {
			this.validateInit(nextProps, true);
		}
	}

	// This will update validation in the case that an input is conditionally visible
	componentWillUnmount() {
		if (!this.props.preserveState) {
			let input = {
				'name': this.props.name,
				'formName': this.state.formName
			}
			setTimeout(() => {
				this.props.removeInput(input);
			});
		}
	}

	validateInit(props, propsHaveLoaded = false) {
		let elem = ReactDOM.findDOMNode(this);
		let formName = elem.closest('.form').getAttribute('name');
		let existingInput = propsHaveLoaded ? false : getInput(props.forms, formName, props.name);
		if (existingInput) {
			this.setState(existingInput);
			return;
		}
		let validity = props.required ? (props.value ? true : false) : true;
		let input = {
			'name': props.name,
			'value': props.value,
			'formName': formName,
			'valid': validity
		};
		this.setState(input);
		if (propsHaveLoaded) {
			input.initial = false;
			this.setState({
				'initial': false
			})
		}
		input = Object.assign({}, this.state, input);
		setTimeout(() => {
			this.props.addInput(input);
		});
	}

	validateInput(e) {
		e.preventDefault();
		let validity = this.props.required ? (e.target.value ? true : false) : true;
		let input = {
			'name': e.target.name,
			'value': e.target.value,
			'valid': validity,
			'initial': false,
			'pristine': false
		}
		input = Object.assign({}, this.state, input);
		this.setState(input);
		this.props.addInput(input);
		this.props.handleInputChange(e);
	}

	handleMouseDown() {
		let input = Object.assign({}, this.state, {'touched': true});
		this.setState(input);
		this.props.addInput(input);
	}

	handleFocus() {
		let input = Object.assign({}, this.state, {'focused': true, 'blurred': false});
		this.setState(input);
		this.props.addInput(input);
	}

	handleBlur() {
		let input = Object.assign({}, this.state, {'focused': false, 'blurred': true});
		this.setState(input);
		this.props.addInput(input);
	}

	render() {
		let validationClasses = classNames({
			'valid': this.state.valid,
			'invalid': !this.state.valid,
			'touched': this.state.touched,
			'untouched': !this.state.touched,
			'pristine': this.state.pristine,
			'focused': this.state.focused,
			'blurred': this.state.blurred,
			'dirty': !this.state.pristine
		});

		return (
			<div className="validate-error-element">
				<textarea className={validationClasses} type={this.props.type} name={this.props.name} value={this.props.value} rows={this.props.rows} placeholder={this.props.placeholder} onChange={this.validateInput} onMouseDown={this.handleMouseDown} onFocus={this.handleFocus} onBlur={this.handleBlur} disabled={this.props.disabled}>
				</textarea>
			</div>
		)
	}
}

TextArea.propTypes = {
	'name': React.PropTypes.string.isRequired,
	'value': React.PropTypes.string,
	'placeholder': React.PropTypes.string,
	'rows': React.PropTypes.string,
	'handleInputChange': React.PropTypes.func.isRequired,
	'preserveState': React.PropTypes.bool,
	'required': React.PropTypes.bool,
	'disabled': React.PropTypes.bool
}

TextArea.defaultProps = {
	'preserveState': false
};

export default connect(mapStateToProps, mapDispatchToProps)(TextArea);
