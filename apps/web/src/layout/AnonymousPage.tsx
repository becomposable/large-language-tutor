import {
  Box,
  Heading,
  Link,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import GoogleSignInButton from "../features/user/GoogleSignInButton";

export default function AnonymousPage() {
  return (
    <VStack mt="20">
      <Heading as="h2">Welcome to (Large) Language Tutor</Heading>
      <Box py={8} px={12} maxW={"4xl"}>
        <Text py={2}>
          This is an experiment to work with LLM (Large Language Models) to
          create a language tutor and assistant that aids in language learning.
          It's an initiative by the team at{" "}
          <Link
            href="https://composableprompts.com"
            target="_tab"
            textDecorationLine={"underline"}
          >
            Composable Prompts
          </Link>{" "}
          as part of our ongoing research into programming models for LLMs.
        </Text>
        <Text py={2}>
          We've utilized a large language model (specifically GPT-4) and adopted
          a multi-agent/multi-task approach to implement features and behaviors.
          Structured data I/O facilitates the integration of the LLM's
          processing capabilities into the app.
        </Text>
        <Text py={2}>
          The intention is to delegate deterministic tasks to the application's
          business logic while leaning on the LLM for undeterministic tasks.
          This is achieved by translating results from the LLM into the
          applications through a structured schema. States are crafted using
          Interactions, which consist of parametrized Prompt Segments and Input
          Data—essentially, data schema responses from the LLM.
        </Text>
        <Text py={2}>
          The primary objective was to explore potential programming models for
          LLM-driven learning systems. The applications span general education
          (like math and science) to corporate training and knowledge
          maintenance.
        </Text>
        <Box>
          <Text py={2}>
            To learn more about this project:
            <List listStyleType={"initial"} py={2} px={4}>
              <ListItem>
                <Link
                  textDecorationLine={"underline"}
                  href="https://composableprompts.com/blog/2023-10-24_large-language-tutor-llm-powered-language-learning"
                >
                  (Large) Language Tutor: Exploring LLM-Powered Language
                  Learning
                </Link>
              </ListItem>
              <ListItem>
                The code for this project is available on the{" "}
                <Link
                  textDecorationLine={"underline"}
                  href="https://github.com/dengenlabs/large-language-tutor"
                >
                  Github Repository
                </Link>
              </ListItem>
            </List>
          </Text>
        </Box>
      </Box>
      <Box maxWidth="md">
        <Text py={4}>
          To try out, just login with a Google Account, and give it a spin!
        </Text>
        <GoogleSignInButton />
      </Box>
    </VStack>
  );
}
