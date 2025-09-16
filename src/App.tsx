// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
import ExternalApiButton from "./components/ExternalApiButton";
import { Authenticator, View, Heading, Button } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import SessionInspector from "./components/SessionInspector";
import AuthDebug from "./components/AuthDebug";

// const client = generateClient<Schema>();

function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  // function createTodo() {
  //   client.models.Todo.create({ content: window.prompt("Todo content") });
  // }

  return (
    <main>
      <Authenticator>
        {({ signOut, user }) => (
          <View padding="1rem">
            <Heading level={3}>こんにちは {user?.username}</Heading>
            <SessionInspector></SessionInspector>
            <Button onClick={signOut}>サインアウト</Button>
            <div><ExternalApiButton /></div>

          </View>
        )}
      </Authenticator>
      <AuthDebug />
    </main>
  );
}

export default App;
