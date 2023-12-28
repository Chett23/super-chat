import "./App.css";
import React from "react";
import { useState, useRef } from "react";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
	getFirestore,
	collection,
	query,
	orderBy,
	limit,
	serverTimestamp,
	addDoc,
} from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebase = initializeApp({
	apiKey: "AIzaSyCnYR6ZyxKFd-GXRTjkTmsuWbIjpo3zNRA",
	authDomain: "chat-room-project-987af.firebaseapp.com",
	projectId: "chat-room-project-987af",
	storageBucket: "chat-room-project-987af.appspot.com",
	messagingSenderId: "339025162362",
	appId: "1:339025162362:web:334985bde6845a4fa9cbc3",
	measurementId: "G-7JFLXNB0QB",
});

const auth = getAuth(firebase);
const firestore = getFirestore(firebase);

function App() {
	const [user] = useAuthState(auth);

	return (
		<div className="App">
			<header>
				<h1>Super Chat</h1>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	};

	return <button onClick={signInWithGoogle}>Sign In With Google</button>;
}
function SignOut() {
	const handleSignout = () =>
		auth.signOut().then(
			function () {
				console.log("Signed Out");
			},
			function (error) {
				console.error("Sign Out Error", error);
			}
		);
	return (
		auth.currentUser && <button onClick={handleSignout}>Sign Out</button>
	);
}

function ChatRoom() {
	const messagesRef = collection(firestore, "messages");
	const mesagesQuery = query(messagesRef, orderBy("createdAt"), limit(25));
	const [messages] = useCollectionData(mesagesQuery);

	const [formValue, setFormValue] = useState("");

	const bottomchatlogDiv = useRef();

	const sendMessage = async (e) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await addDoc(messagesRef, {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");

		bottomchatlogDiv.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg, i) => (
						<ChatMessage key={`${i} - ${msg.uid}`} message={msg} />
					))}
				<div ref={bottomchatlogDiv} />
			</main>
			<form onSubmit={sendMessage}>
				<input
					placeholder="Chat"
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>
				<button type="submit">SEND</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid == auth.currentUser.uid ? "sent" : "received";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt="" />
			<p>{text}</p>
		</div>
	);
}

export default App;
