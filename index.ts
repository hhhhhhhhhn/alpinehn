// @ts-ignore
import * as fs from "node:fs"

function Page(slot: string, title: string): string {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"></script>
		<script src="//unpkg.com/alpinejs" defer></script>
		<script src="https://cdn.tailwindcss.com"></script>

		<title>${title}</title>
	</head>
	<body>
		${slot}
	</body>
	</html>
`
}

function HackerNews(): string {
	return `
	<div x-data="{
		postIds: [],
		async retrieve() { this.postIds = await (await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')).json()}
	}", x-init="retrieve()">
		<template x-for="id in postIds">
			${Story("id")}
		</template>
	</div>
	`
}

function Story(id: string): string {
//	return `
//		<div x-data="{visible: true}">
//			<p x-show="visible" x-text="${id}"></p>
//			<button @click="visible = !visible">Click me</button>
//		</div>
//	`
	return `
		<div x-data="{
			postData: {waiting: true},
			async retrieve() { this.postData = await (await fetch(\`https://hacker-news.firebaseio.com/v0/item/\${${id}}.json\`)).json()}
		}", x-intersect.once.margin.500px="retrieve()" class="p-4 border-b-2">
			<a x-bind:href="postData.url" target="_blank">
				<h1 x-text="postData.title" class="font-bold text-xl"></h1>
			</a>
			<h2 x-text="\`By \${postData.by}\`"></h2>
			<h3 x-text="\`Score: \${postData.score}\`"></h3>
			<a x-bind:href="\`/comments.html?id=\${${id}}\`" class="font-bold" target="_blank">
				Comments
			</a>
		</div>
	`
}

function Comments(): string {
	return `
		<div x-data="{
			id: (new URLSearchParams(window.location.search)).get('id'),
			postData: {waiting: true},
			async retrieve() { this.postData = await (await fetch(\`https://hacker-news.firebaseio.com/v0/item/\${this.id}.json\`)).json()}
		}", x-intersect.once.margin.500px="retrieve()">
			<div class="p-4">
				<a x-bind:href="postData.url">
					<h1 x-text="postData.title" class="font-bold text-xl"></h1>
				</a>
				<h2 x-text="\`By \${postData.by}\`"></h2>
				<h3 x-text="\`Score: \${postData.score}\`"></h3>
			</div>
			<template x-for="id in postData.kids">
				<div x-html="document.getElementById('comment').innerHTML" class="m-4"></div>
			</template>
			<hr>
		</div>
		<template id="comment">
			<div x-data="{
				postData: {waiting: true},
				async retrieve() { this.postData = await (await fetch(\`https://hacker-news.firebaseio.com/v0/item/\${id}.json\`)).json()}
			}" x-intersect.once.margin.300px="retrieve()" class="border-l-2 px-4 pt-4">
				<a x-bind:href="postData.url">
					<h1 x-text="postData.title"></h1>
				</a>
				<h3 x-text="postData.by || 'deleted'" class="font-bold"></h3>
				<p x-html="postData.text || ''"></p>
				<div class="m-2">
				<template x-for="id in postData.kids">
					<div x-html="document.getElementById('comment').innerHTML" class="m-4"></div>
				</template>
				</div>
			</div>
		</template>
	`
}

function main() {
	fs.writeFileSync("docs/index.html", Page(HackerNews(), "Hacker News"))
	fs.writeFileSync("docs/comments.html", Page(Comments(), "Comments"))
}

main()
