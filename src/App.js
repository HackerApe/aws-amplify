import React, { useEffect, useState } from "react"
import { API } from "aws-amplify"
import {
	withAuthenticator,
	Button,
	View,
	Flex,
	Heading,
	Image,
	Text,
	TextField,
} from "@aws-amplify/ui-react"
import { listNotes } from "./graphql/queries"
import {
	createNote as createNoteMutation,
	deleteNote as deleteNoteMutation,
} from "./graphql/mutations"
import "@aws-amplify/ui-react/styles.css"

const initialFormState = { name: "", description: "" }

const App = ({ signOut }) => {
	const [notes, setNotes] = useState([])
	const [formData, setFormData] = useState(initialFormState)

	useEffect(() => {
		fetchNotes()
	}, [])

	const fetchNotes = async () => {
		const apiData = await API.graphql({ query: listNotes })
		const notesFromApi = apiData.data.listNotes.items

		await Promise.all(
			notesFromApi.map(async (note) => {
				if (note.image) {
					const url = await Storage.get(note.name)
					note.image = url
				}
				return note
			})
		)

		setNotes(notesFromApi)
	}

	const createNote = async (event) => {
		event.preventDefault()

		const form = new FormData(event.target)
		const image = form.get("image")
		const data = {
			name: form.get("name"),
			description: form.get("description"),
			image: image.name,
		}

		if (!!data.image) await Storage.put(data.name, image)
		await API.graphql({ query: createNoteMutation, variables: { input: data } })

		fetchNotes()
		event.target.reset()
	}

	const deleteNote = async ({ id, name }) => {
		const newNotesArray = notes.filter((note) => note.id !== id)
		setNotes(newNotesArray)
		await Storage.remove(name)
		await API.graphql({ query: deleteNoteMutation, variables: { input: id } })
	}

	return (
		<View>
			<h1>My Notes App</h1>
			<input
				onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				placeholder="Note name"
				value={formData.name}
			/>
			<input
				onChange={(e) =>
					setFormData({ ...formData, description: e.target.value })
				}
				placeholder="Note description"
				value={formData.description}
			/>
			<View name="image" as="input" type="file" style={{ alignSelf: "end" }} />
			<button onClick={createNote}>Create Note</button>
			<div style={{ marginBottom: 30 }}>
				{notes.map((note) => (
					<Flex
						key={note.id || note.name}
						direction="row"
						justifyContent="center"
						alignItems="center"
					>
						<Text as="strong" fontWeight={700}>
							{note.name}
						</Text>
						<Text as="span">{note.description}</Text>
						{note.image && (
							<Image
								src={note.image}
								alt={`visual aid for ${notes.name}`}
								style={{ width: 400 }}
							/>
						)}
						<Button variation="link" onClick={() => deleteNote(note)}>
							Delete note
						</Button>
					</Flex>
				))}
			</div>
			<Button onClick={signOut}>Sign Out</Button>
		</View>
	)
}

export default withAuthenticator(App)
