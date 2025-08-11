import React, { FC, useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import USERS, { getUserDataWithUsername } from '../../../common/data/userDummyData';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: FC<ILoginProps> = ({ isSignUp }) => {
	const { setUser } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();
	const [signInPassword, setSignInPassword] = useState<boolean>(false);
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const navigate = useNavigate();
	const handleOnClick = useCallback(() => navigate('/'), [navigate]);

	React.useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (token) {
			navigate('/');
		}
	}, [navigate]);

	const formik = useFormik({
		enableReinitialize: true,
		   initialValues: {
			   loginUsername: '',
			   loginPassword: '',
			   // For sign up
			   signupEmail: '',
			   signupName: '',
			   signupPassword: '',
		   },
		validate: (values) => {
			const errors: any = {};
			if (!singUpStatus) {
				if (!values.loginUsername) errors.loginUsername = 'Required';
				if (!values.loginPassword) errors.loginPassword = 'Required';
			   } else {
				   if (!values.signupEmail) errors.signupEmail = 'Required';
				   if (!values.signupName) errors.signupName = 'Required';
				   if (!values.signupPassword) errors.signupPassword = 'Required';
			   }
			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			setErrorMsg(null);
			if (!singUpStatus) {
				// LOGIN
				setIsLoading(true);
				try {
					const res = await fetch('http://localhost:8000/auth/login', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							email: values.loginUsername,
							password: values.loginPassword,
						}),
					});
					const data = await res.json();
					if (res.ok) {
						if (data.access_token) {
							localStorage.setItem('access_token', data.access_token);
						}
						if (setUser) setUser(values.loginUsername);
						handleOnClick();
					} else {
						setErrorMsg(data.message || 'Login failed.');
					}
				} catch (err) {
					setErrorMsg('Network error.');
				} finally {
					setIsLoading(false);
				}
			} else {
				// SIGN UP
				setIsLoading(true);
				   try {
					   const res = await fetch('http://localhost:8000/auth/signup', {
						   method: 'POST',
						   headers: { 'Content-Type': 'application/json' },
						   body: JSON.stringify({
							   email: values.signupEmail,
							   password: values.signupPassword,
							   username: values.signupName,
						   }),
					   });
					   const data = await res.json();
					   if (res.ok) {
						   if (setUser) setUser(data.user || values.signupEmail);
						   handleOnClick();
					   } else {
						   setErrorMsg(data.message || 'Sign up failed.');
					   }
				   } catch (err) {
					   setErrorMsg('Network error.');
				   } finally {
					   setIsLoading(false);
				   }
			}
		},
	});

	const handleContinue = () => {
		// For login: show password field after username
		if (!formik.values.loginUsername) {
			formik.setFieldError('loginUsername', 'Required');
			return;
		}
		setSignInPassword(true);
	};

	return (
		<PageWrapper
			isProtected={false}
			title={singUpStatus ? 'Sign Up' : 'Login'}
			className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-5'>
									<Link
										to='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Facit'>
										<Logo width={200} />
									</Link>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}>
									<div className='row row-cols-2 g-3 pb-3 px-3 mt-0'>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight={singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => {
													setSignInPassword(false);
													setSingUpStatus(!singUpStatus);
												}}>
												Login
											</Button>
										</div>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight={!singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => {
													setSignInPassword(false);
													setSingUpStatus(!singUpStatus);
												}}>
												Sign Up
											</Button>
										</div>
									</div>
								</div>

								<LoginHeader isNewUser={singUpStatus} />

								{errorMsg && (
									<Alert isLight color="danger" icon="Lock" isDismissible>
										{errorMsg}
									</Alert>
								)}

								<form className='row g-4' onSubmit={formik.handleSubmit}>
									{singUpStatus ? (
										<>
											<div className='col-12'>
												<FormGroup
													id='signup-email'
													isFloating
													label='Your email'>
													<Input
														type='email'
														autoComplete='email'
														name='signupEmail'
														value={formik.values.signupEmail}
														isTouched={formik.touched.signupEmail}
														invalidFeedback={formik.errors.signupEmail}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-name'
													isFloating
													label='Your name'>
													<Input
														name='signupName'
														autoComplete='given-name'
														value={formik.values.signupName}
														isTouched={formik.touched.signupName}
														invalidFeedback={formik.errors.signupName}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
													/>
												</FormGroup>
											</div>
											   {/* Surname field removed as per backend requirements */}
											<div className='col-12'>
												<FormGroup
													id='signup-password'
													isFloating
													label='Password'>
													<Input
														type='password'
														name='signupPassword'
														autoComplete='password'
														value={formik.values.signupPassword}
														isTouched={formik.touched.signupPassword}
														invalidFeedback={formik.errors.signupPassword}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<Button
													color='info'
													className='w-100 py-3'
													type='submit'
													isDisable={isLoading}
												>
													{isLoading && <Spinner isSmall inButton isGrow />}
													Sign Up
												</Button>
											</div>
										</>
									) : (
										<>
											<div className='col-12'>
												<FormGroup
													id='loginUsername'
													isFloating
													label='Your email or username'
													className={classNames({
														'd-none': signInPassword,
													})}>
													<Input
														autoComplete='username'
														name='loginUsername'
														value={formik.values.loginUsername}
														isTouched={formik.touched.loginUsername}
														invalidFeedback={formik.errors.loginUsername}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														onFocus={() => {
															formik.setErrors({});
														}}
													/>
												</FormGroup>
												{signInPassword && (
													<div className='text-center h4 mb-3 fw-bold'>
														Hi, {formik.values.loginUsername}.
													</div>
												)}
												<FormGroup
													id='loginPassword'
													isFloating
													label='Password'
													className={classNames({
														'd-none': !signInPassword,
													})}>
													<Input
														type='password'
														name='loginPassword'
														autoComplete='current-password'
														value={formik.values.loginPassword}
														isTouched={formik.touched.loginPassword}
														invalidFeedback={formik.errors.loginPassword}
														validFeedback='Looks good!'
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												{!signInPassword ? (
													<Button
														color='warning'
														className='w-100 py-3'
														isDisable={!formik.values.loginUsername || isLoading}
														onClick={handleContinue}
													>
														{isLoading && <Spinner isSmall inButton isGrow />}
														Continue
													</Button>
												) : (
													<Button
														color='warning'
														className='w-100 py-3'
														type='submit'
														isDisable={isLoading}
													>
														{isLoading && <Spinner isSmall inButton isGrow />}
														Login
													</Button>
												)}
											</div>
										</>
									)}

									{/* BEGIN :: Social Login */}
									{!signInPassword && (
										<>
											<div className='col-12 mt-3 text-center text-muted'>
												OR
											</div>
											<div className='col-12 mt-3'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomApple'
													onClick={handleOnClick}>
													Sign in with Apple
												</Button>
											</div>
											<div className='col-12'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomGoogle'
													onClick={handleOnClick}>
													Continue with Google
												</Button>
											</div>
										</>
									)}
									{/* END :: Social Login */}
								</form>
							</CardBody>
						</Card>
						<div className='text-center'>
							<a
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Privacy policy
							</a>
							<a
								href='/'
								className={classNames('link-light text-decoration-none', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Terms of use
							</a>
						</div>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Login;
