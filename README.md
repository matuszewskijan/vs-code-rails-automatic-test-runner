# Rails Automatic Test Runner for VS Code

Run your test files automatically on your source file save.

### How it works?
While saving any application `app/models/{your_model}.rb` file it will look for it's corresponding test file, depends on test framework you use it could be either: `spec/models/{your_model}_spec.rb`(RSpec) or `test/models/{your_model}_test.rb`(Minitest).

The results of the test command will be displayed in the `Output` tab:
\!\[Example output\]\(images/example-output.png\)

**Supports:**
- RSpec
- Minitest

### Setup
1. Create new VS Code workspace with your Rails application as the root folder
1. Choose your testing framework in extension settings
1. Make sure you have specified proper test directory in settings
1. Try saving any of your files in `/app` directory, it should either run test or display `no corresponding test file found` error

## Extension Settings
* `railsAutomaticTestRunner.framework`: Specifies which framework is used to execute test commands
* `railsAutomaticTestRunner.testsDirectory`: Specifies the folder where your test files are located
* `railsAutomaticTestRunner.bundleExec`: Append `bundle exec` before test command?
* `railsAutomaticTestRunner.envVariables`: Pass any environment variables as a string there, eg: `CRUCIAL_API_KEY=test`
* `railsAutomaticTestRunner.args`: Pass any arguments like `--fail-fast` as a string there
* `railsAutomaticTestRunner.automaticOutputDisplay`: Automatically switch to the output tab, when enabled might interrupt terminal work
