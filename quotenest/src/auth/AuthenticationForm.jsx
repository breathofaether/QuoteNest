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
            terms: true,
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async () => {
        try {
            if (type === 'register') {
                await registerUser(email, password, form.values.username)
                onClose;
                notifications.show({
                    title: "Account Created",
                    message: "You have successfully registered!",
                    autoClose: 3000,
                    color: "green",
                });
            } else {
                await loginUser(email, password);
                onClose;
                notifications.show({
                    title: "Login Successful",
                    message: "You are now logged in!",
                    autoClose: 3000,
                    color: "blue",
                });
            }
        } catch (error) {
            notifications.show(
                {
                    title: "Authentication Error",
                    message: "Something went wrong. Please try again.",
                    autoClose: 3000,
                    color: "red",
                }
            )
        }
    }

    return (
        <Modal opened={opened} onClose={onClose}
            title={type === 'register' ? "Sign Up" : "Login"}
            centered
        >
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
                                value={form.values.name}
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
                            error={form.errors.email && 'Invalid email'}
                            radius="md"
                        />
                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                            error={form.errors.password && 'Password should include at least 6 characters'}
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