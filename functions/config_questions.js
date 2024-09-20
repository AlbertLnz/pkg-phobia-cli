import * as p from '@clack/prompts'
import pc from 'picocolors'

export async function askQuestion(
  question,
  optionsLabel,
  optionsValue,
  initialValue
) {
  const options = optionsValue.map((value, index) => ({
    label: `${pc.bold(pc.dim(optionsLabel[index]))}`,
    value: value,
  }))

  const answer = await p.select({
    message: pc.blueBright(pc.bold(question)),
    options: options,
    initialValue: pc.yellowBright(initialValue),
  })

  return answer
}
