import '../styles/AccountStatus.css';

function AccountStatus({ user, signOut }) {
    return (
        <div className="account-status">
            <h2>{user.username}</h2>
            <button
                className="amplify-button"
                data-variation="primary"
                onClick={signOut}
            >Sign out</button>
        </div>
    );
}

export default AccountStatus;
