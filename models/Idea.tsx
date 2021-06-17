interface IIdea {
    category: string,
    type: string,
    scamper: string,
    subject: string,
    detail: object,
    images: string[],
    links: string[]
}

export default class Idea {
    idea = {
        category: '',
        type: '',
        scamper: '',
        subject: '',
        detail: {},
        images: [],
        links: []
    };

    constructor()
    constructor(idea?: IIdea){
        idea && (this.idea = idea);
    }

    get category(){
        return this.idea.category;
    }
    setCategory(category: string){
        this.idea.category = category
    }

    get type(){
        return this.idea.type;
    }
    setType(type: string){
        this.idea.type = type
    }

    get scamper(){
        return this.idea.scamper;
    }
    setScamper(scamper:string){
        this.idea.scamper = scamper;
    }

    get subject(){
        return this.idea.subject;
    }
    setSubject(subject:string){
        this.idea.subject = subject;
    }

    get ideaDetail(){
        return this.idea.detail;
    }
    setIdeaDetail(detail: object){
        this.idea.detail = detail;
    }

    get images(){
        return this.idea.images;
    }
    setImages(images: string[]){
        return this.idea.images = images;
    }

    get links(){
        return this.idea.links;
    }
    setLinks(links: string[]){
        return this.idea.links = links;
    }
}