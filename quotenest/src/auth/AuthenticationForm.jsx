import {
    Modal,
    Anchor,
    Button,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { registerUser, loginUser } from './firebaseConfig';
import { notifications } from '@mantine/notifications';

export function AuthenticationForm({ opened, onClose }) {
    const [type, toggle] = useToggle(['login', 'register']);

    const form = useForm({
        initialValues: {
            email: '',
            username: '',
            password: '',
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async () => {
        try {
            if (type === 'register') {
                await registerUser(form.values.email, form.values.password, form.values.username);
                onClose();
                form.reset();
                notifications.show({
                    title: "Account Created",
                    message: "You have successfully registered!",
                    autoClose: 3000,
                    color: "green",
                });

            } else {
                await loginUser(form.values.email, form.values.password);
                onClose();
                notifications.show({
                    title: "Login Successful",
                    message: `You are now logged in ${form.values.username}!`,
                    autoClose: 3000,
                    color: "blue",
                });
                form.reset();
            }
        } catch (error) {
            form.reset()
            if (error.code === "auth/email-already-in-use") {
                notifications.show({
                    title: "Registration Failed",
                    message: "This email is already in use. Please log in instead.",
                    autoClose: 3000,
                    color: "red",
                });
            } else if (error.code === "auth/invalid-email") {
                notifications.show({
                    title: "Invalid Email",
                    message: "Please enter a valid email address.",
                    autoClose: 3000,
                    color: "red",
                });
            } else if (error.code === "auth/weak-password") {
                notifications.show({
                    title: "Weak Password",
                    message: "Password should be at least 6 characters.",
                    autoClose: 3000,
                    color: "red",
                });
            } else {
                notifications.show({
                    title: "Authentication Error",
                    message: "Something went wrong. Please try again.",
                    autoClose: 3000,
                    color: "red",
                });
            }
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={upperFirst(type)} centered>
            <Paper radius="md" p="xl" withBorder>
                <Center>
                    <Text size="lg" fw={500}>
                        Welcome to Quotenest
                    </Text>
                </Center>
                <Divider label="Login with email" labelPosition="center" my="lg" />
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        {type === 'register' && (
                            <TextInput
                                label="Username"
                                placeholder="Your username"
                                value={form.values.username}
                                onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
                                radius="md"
                            />
                        )}
                        <TextInput
                            required
                            label="Email"
                            placeholder="hello@example.com"
                            value={form.values.email}
                            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                            error={form.errors.email}
                            radius="md"
                        />
                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                            error={form.errors.password}
                            radius="md"
                        />
                    </Stack>
                    <Group justify="space-between" mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                            {type === 'register'
                                ? 'Already have an account? Login'
                                : "Don't have an account? Register"}
                        </Anchor>
                        <Button type="submit" radius="xl">
                            {upperFirst(type)}
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Modal>
    );
}
