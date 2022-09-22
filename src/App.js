import {
	withAuthenticator,
	Button,
	Heading,
	View,
	Card,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const App = ({ signOut }) => {
	return (
		<View>
			<Card>
				<Heading level={1}>Now We Have AUTH</Heading>
			</Card>
			<Button onClick={signOut}>Sign Out</Button>
		</View>
	);
};

export default withAuthenticator(App);
