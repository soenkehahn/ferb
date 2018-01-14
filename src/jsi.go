package main

import "log"
import "os"
import "io/ioutil"
import "os/exec"
import "os/user"
import "bytes"
import "strings"

func getHomeDir() string {
	usr, err := user.Current()
	if err != nil {
		log.Fatal("fixme")
	}
	return usr.HomeDir
}

func doesExistInHome(path string) bool {
	homeDir := getHomeDir()
	_, err2 := os.Stat(homeDir + "/" + path)
	if err2 == nil {
		return true
	} else {
		return false
	}
}

func main() {
	setupProject()

	scriptFile := os.Args[1]
	runFlow(scriptFile)
	runBabelNode()
}

func runInProject(installCommand *exec.Cmd) {
	homeDir := getHomeDir()
	mkdirErr := os.MkdirAll(homeDir+"/.jsi/project", os.ModePerm)
	if mkdirErr != nil {
		log.Fatal("mkdir fixme")
	}
	installCommand.Dir = homeDir + "/.jsi/project"
	var stdout bytes.Buffer
	installCommand.Stdout = &stdout
	var stderr bytes.Buffer
	installCommand.Stderr = &stderr
	err := installCommand.Run()
	os.Stderr.WriteString(stdout.String())
	os.Stderr.WriteString(stderr.String())
	if err != nil {
		log.Fatal(err)
	}
}

func setupProject() {
	if !doesExistInHome(".jsi/project/node_modules/.bin/babel-node") {
		runInProject(exec.Command("yarn", "add",
			"babel-cli",
			"babel-plugin-transform-flow-strip-types"))
	}
	if !doesExistInHome(".jsi/project/node_modules/.bin/flow") {
		runInProject(exec.Command("yarn", "add", "flow-bin"))
	}
	if !doesExistInHome(".jsi/project/.flowconfig") {
		runInProject(exec.Command("node_modules/.bin/flow", "init"))
	}
	if !doesExistInHome(".jsi/project/node_modules/babel-preset-env") {
		runInProject(exec.Command("yarn", "add", "babel-preset-env"))
	}
}

func readFile(file string) string {
	handle, readErr := ioutil.ReadFile(file)
	if readErr != nil {
		log.Fatal(readErr)
	}
	return string(handle)
}

func runFlow(file string) {
	homeDir := getHomeDir()
	flowCommand := exec.Command(
		homeDir+"/.jsi/project/node_modules/.bin/flow",
		"check-contents",
		"--quiet")
	flowCommand.Dir = homeDir + "/.jsi/project"

	flowCommand.Stdin = strings.NewReader(readFile(file))
	var stdout bytes.Buffer
	flowCommand.Stdout = &stdout
	var stderr bytes.Buffer
	flowCommand.Stderr = &stderr
	err := flowCommand.Run()
	os.Stderr.WriteString(stdout.String())
	os.Stderr.WriteString(stderr.String())
	if err != nil {
		log.Fatal(err)
	}
}

func runBabelNode() {
	homeDir := getHomeDir()
	command := exec.Command(
		homeDir+"/.jsi/project/node_modules/.bin/babel-node",
		"--plugins", "transform-flow-strip-types",
		"--presets", "env",
		os.Args[1])
	command.Env = append(os.Environ(), "NODE_PATH="+homeDir+"/.jsi/project/node_modules")
	var stdout bytes.Buffer
	command.Stdout = &stdout
	var stderr bytes.Buffer
	command.Stderr = &stderr
	err := command.Run()
	os.Stdout.WriteString(stdout.String())
	os.Stderr.WriteString(stderr.String())
	if err != nil {
		log.Fatal(err)
	}
}
