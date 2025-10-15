import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import questions from './questions.json';

export default function App() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[index];

  const handleAnswer = (correct) => {
    if (correct) setScore(score + 1);
    if (index + 1 < questions.length) setIndex(index + 1);
    else setFinished(true);
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const message =
      score > 17 ? '🧙‍♂️ Maître sorcier !' :
      score > 12 ? '✨ Sorcier confirmé !' :
      score > 7 ? '🔮 Apprenti prometteur !' :
      '🐍 Moldu curieux...';

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Résultat final</Text>
        <Text style={styles.score}>Score : {score} / {questions.length}</Text>
        <Text style={styles.result}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={restartQuiz}>
          <Text style={styles.buttonText}>Rejouer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Question {index + 1} / {questions.length}</Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>
      <FlatList
        data={currentQuestion.answers}
        keyExtractor={(item) => item.text}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.button} onPress={() => handleAnswer(item.correct)}>
            <Text style={styles.buttonText}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1e3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c2c54',
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#40407a',
  },
  button: {
    backgroundColor: '#ccae62',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: '#1e272e',
    textAlign: 'center',
    fontWeight: '600',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  result: {
    fontSize: 18,
    marginBottom: 20,
  },
});
