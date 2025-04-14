import axios from 'axios';

export async function getUserRepo(username){
    const repo = await axios.get(`https://api.github.com/users/${username}/repos`);
    return repo?.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
}

export async function getRecentCommits(username){
    const commits = await axios.get(`https://api.github.com/users/${username}/events`);
    const filteredCommits = commits.data.filter(event => event.type === 'PushEvent').slice(0, 5);
    return filteredCommits?.slice(0, 5);
}