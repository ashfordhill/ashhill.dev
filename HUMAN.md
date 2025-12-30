# Human Notes

Notes written by a human being in regard to using generative coding tools.

## Tips

- Focus less on trying to maintain the code architecture if wanting to go full-generative.
  - Instead, divide features by folders and try to reduce 'global' code. This way, multiple coding agents can be used in the same code base without stepping over each other. Also, it helps keep their context + scope.
    - Also, helps with being able to commit 'good' code from 1 agent working on 1 feature, and discard or wait on committing changes from another agent working on another feature that may not ready to be committed.
  - Once using generative code, it's unlikely manual coding will happen often. A certain level of understanding needs to happen for when issues arise. 
- Mix use of LLMs. Some do better with certain types of coding tasks than other (UI vs backend, testing, large changes vs small tweaks, bugfixes, etc.)
- Use one LLM to come up with a thorough high-level design and then feed all of the detailed instructions to another LLM. This might be more efficient for describing a lot of details for a larger-scale scope than what a human could reasonably do.

## Which Models, which Tools?


### Favorite LLM History

**8/16/2025**
Dunno if I even have a favorite at this point. GPT 5 seems good for design/high-level/'right brain' but I prefer Sonnet 4 parallel thinking for execution and implementation. Unfortunately this is more resource intensive and not as easily/freely accessible atm.

**8/1/2025**
Copilot Chat with Claude Sonnet 4 has been doing well. Curious to know where this ones strengths/weaknesses are compared to the Zencoder blended model.

### Zencoder with VS Code

How does this only have `62,548` downloads rn???

Zencoder has been a top contender; it is able to handle sweeping, generic visual changes especially well. **Probably a good tool for large, sweeping changes**.

You can also use 2+ chats at once. Although, because it likes to run builds and dev servers to test its own changes, this can end up getting buggy and weird. Probably best to have it not test changes and have multi-chats going on for different features that for sure won't touch each other. This does speed up development by quite a bit..when it works out.

When coming up with a strategy to use png assets as tiles, it seemed to reach a wall with smooth implementations. 

Possible reasons:
  - The tile assets didn't have directionally-descriptive names. I suggested that it use random .PNGs with descriptive names that would make sense to both AI and human. Then the grid could be predefined with these and the human can go back and swap the actual content of the PNGs, keeping the same name. That way the AI tool doesn't have to hurt itself in confusion trying to do such tedious, specific visual work.
    - e.g. - swap some random tile named `road_corner_NE.png` for the PNG of the actual tile since the AI tool isn't going to get it right, especially with isometric 2D tiles 😵‍💫
  - The .tsx component that loads a lot of the game logic is 600+ lines long and could use a refactoring. Much of it has gotten cumbersome and ugly to read through. In its purely generated and re-generated state, **I don't think such a file would be easily maintainable by a human**.
  - Prompt might be too broad, might need more 'what not to do's. Dunno

Downsides is that when your daily limit runs out, it goes into "slow mode" which is..extremely slow. I upgraded to the 550 premium prompts a day and burned through them in a heavy coding session before my 24 hours were up.

Zencoder also offers filtering options for stuff like `node_modules/**` in its settings. It's definitely flushed out and thought through as a tool for developers.

### ChatGPT as desktop app

ChatGPT still continues to be Ol' Reliable. I did see some interesting behavior when I asked it to Deep Research steps for me to give to Zencoder, to help Zencoder have a more complex, thought out strategy to come up with the tile asset implementations (take these randomly named PNGs and put them in my game grid instead of the colored `<Box>` components).

While it didn't quite get integrated with Zencoder's existing solution, **it seemed like offering the Deep Research steps from ChatGPT to Zencoder likely got Zencoder to take a way different approach** than if I just asked it via prompt, even a well-written prompt. I tried several times with Zencoder to implement this feature successfully, to no avail.

### GitHub Copilot

I've found GitHub Copilot to be helpful when wanting a deep-drive in a **specific file**. As far as handling a whole directory or sweeping changes, I still prefer Zencoder. Zencoder tends to run the full build (sometimes against my will) to check its own changes, so in general I've found them to be less buggy.

However, I've used Copilot to go back and optimize code that was written by Zencoder. Good to keep in mind that the first generated code is often messy and needs optimization.

Copilots auto-complete when digging into code yourself is useful, although it takes time to get used to it.

### Gemini with VS Code 👎

I ditched this because it offered very basic options for question-asking. You can give it file, folder and API contexts but when I gave it my project folder, it just spun when I asked it a question. 

I'm guessing this is worth a look further in its development lifecycle.


## Future

- It'd be nice to have a way for an AI tool to warn you when the chat is getting too long and context loss/hallucinating might be happening. 

- Zencoder uses a mixed of LLMs under the hood but also offers Claude as an option. I can see **multi-LLM mixing** being used successfully for all-in-one tasks. For instance, I can use Sora on ChatGPT to generate images. Maybe those images are used for a website that another agent designs for me. Maybe a bug-finding or clean-coding enforcing LLM can be applied to a newly generated codebase at the end. A CICD-specific LLM would also be useful, although GPT 4 and 3o have been plenty helpful for that. 
  - Given the issue of context limitations, having multiple specialized LLMs/agents instead of one big monolithic 'all-knowing' LLM would be ideal.

- Zencoder extension + GPT pls