import React, { useState, useEffect } from 'react'
import './App.css'

// @ts-ignore
import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";

import * as ethers from 'ethers';
// @ts-ignore
import ob from 'urbit-ob'

import { FileUploader } from "react-drag-drop-files";

// @ts-ignore
import Autosuggest from 'react-autosuggest';
import { BrowserLevel } from 'browser-level';


let interval: any
const languages = [
  {
    title: '1970s',
    languages: [
      {
        name: 'C',
        year: 1972
      }
    ]
  },
  {
    title: '1980s',
    languages: [
      {
        name: 'C++',
        year: 1983
      },
      {
        name: 'Perl',
        year: 1987
      }
    ]
  },
  {
    title: '1990s',
    languages: [
      {
        name: 'Haskell',
        year: 1990
      },
      {
        name: 'Python',
        year: 1991
      },
      {
        name: 'Java',
        year: 1995
      },
      {
        name: 'Javascript',
        year: 1995
      },
      {
        name: 'PHP',
        year: 1995
      },
      {
        name: 'Ruby',
        year: 1995
      }
    ]
  },
  {
    title: '2000s',
    languages: [
      {
        name: 'C#',
        year: 2000
      },
      {
        name: 'Scala',
        year: 2003
      },
      {
        name: 'Clojure',
        year: 2007
      },
      {
        name: 'Go',
        year: 2009
      }
    ]
  },
  {
    title: '2010s',
    languages: [
      {
        name: 'Elm',
        year: 2012
      }
    ]
  }
];

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str: any) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value: any) {
  const escapedValue = escapeRegexCharacters(value.trim());
  
  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return languages
    .map(section => {
      return {
        title: section.title,
        languages: section.languages.filter(language => regex.test(language.name))
      };
    })
    .filter(section => section.languages.length > 0);
}

function getSuggestionValue(suggestion: any) {
  return suggestion.name;
}

function renderSuggestion(suggestion: any) {
  return (
    <span>{suggestion.name}</span>
  );
}

function renderSectionTitle(section: any) {
  return (
    <strong>{section.title}</strong>
  );
}

function getSectionSuggestions(section: any) {
  return section.languages;
}

class Search extends React.Component<any> {
  constructor(props: any) {
    // @ts-ignore
    super();
    this.state = {
      value: '',
      cols: props.cols,
      model: props.model,
      suggestions: [],
      images: []
    };    
  }

  onChange = (_: any, { newValue }: any) => {
    clearInterval(interval)
      if(document.getElementsByClassName('react-autosuggest__suggestions-container--open').length > 0){
        // @ts-ignore
        document.getElementById('react-autowhatever-1').style.left = '0px !important'
      }

      

      interval = setTimeout(async () => {
        let idsOne: any = newValue.split(' ').map((word: any, i: any) => {
          if(dict[word] && i < 5){
            return dict[word]
          } else if(i < 5){
            return null
          }
        })

        if(idsOne.length <= 5){
          for(let i = 0; idsOne.length < 5; i++){
            idsOne.push(null)
          }
        }

        const input: any = tf.tensor2d(idsOne, [1, 5])

        // @ts-ignore
        const vectorPrediction: any = Array.from(this.state.model.predict(input).dataSync())
        const entries: any = await db.iterator().all()
        console.log(entries)
        const toBeSorted: any = []
        entries.map((image: any, _: any) => {
          console.log(cosineSimilarity(image[1].vector, vectorPrediction))
          toBeSorted.push({
            cosine: cosineSimilarity(image[1].vector, vectorPrediction),
            image: image
          })
        })

        const arr = _.orderBy(toBeSorted, ['cosine'], ['desc']).filter((el: any) => el.cosine > 0.9)
        console.log(arr);

        // @ts-ignore
        this.props.setImages(arr)

      }, 700)
      if(newValue.length == 0){
        // @ts-ignore
        this.props.setImages([])
        clearInterval(interval)

      }

    console.log(newValue)

    
    this.setState({
      value: newValue
    });
  };
  
  onSuggestionsFetchRequested = ({ value }: any) => {
    // if(this.state.images.length > 0){
      this.setState({
        suggestions: getSuggestions(value)
      });
    // } else {
      // this.setState({
        // suggestions: [],
        // images: []
      // });
    // }
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
      images: []
    });
  };

  render() {
    // @ts-ignore
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "search",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest 
        multiSection={true}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        renderSectionTitle={renderSectionTitle}
        getSectionSuggestions={getSectionSuggestions}
        inputProps={inputProps} />
    );
  }
}


const fileTypes = ["JPG", "PNG", "GIF"];

function DragDrop(props: any) {
  const [_, setFile] = useState< any>(null);
  const handleChange = (file: any) => {
    console.log(file)

    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", function () {
        // imgPreview.style.display = "block";
        console.log(this.result)
        props.setImage(this.result);
      });    
    }

    setFile(file);
  };
  return (
    <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
  );
}


// take word corpus
const corpus: any = [
  'The cat sat on the porch',
  'The dog ran in the park',
  'The bird sang in the tree',
  'The bat screeched in the night'
]

const dict: any = {}

// index with vector
corpus.map((line: any) => line.split(' ')).map((words: any) => {
  words.map((word: any) => {
    if(!dict[word.toLowerCase()] && dict[word.toLowerCase()] != 0){
      dict[word.toLowerCase()] = Object.entries(dict).length
    }
  })
})

const corpus_ids: any = corpus.map((line: any) => line.split(' ')).map((words: any) => {
  return words.map((word: any) => {
    return dict[word.toLowerCase()]
  })
})

const contexts: any = []
const targets: any = []

const vocab_size: any = Object.entries(dict).length + 1
const embedding_size: any = 10
const window_size: any = 2


for(let i = 0; i < corpus_ids.length; i ++ ) {
  for(let j = 0; j < corpus_ids[i].length - window_size; j++){
    contexts.push(corpus_ids[i].filter((el: any, k: any) => {
      if(k != (window_size+j)){
        return corpus_ids[i].filter((els: any, j: any) =>{
          if(j != j + 1 + window_size + 1){
            return [el + els]  
          }
        })
      }
    }))
    targets.push(corpus_ids[i])
  }
}

const X: any = tf.tensor(contexts)
const y: any = tf.tensor(targets)

// Helper functions
  const dotProduct = (a: any, b: any) => {
    let product = 0;
    for (let i = 0; i < a.length; i++) {
      product += a[i] * b[i];
    }
    return product;
  };

  const magnitude = (vector: any) => {
    let sum = 0;
    for (let value of vector) {
      sum += value * value;
    }
    return Math.sqrt(sum);
  };

  const cosineSimilarity = (a: any, b: any) => {
    return dotProduct(a, b) / (magnitude(a) * magnitude(b));
  };

let db: any;

function App() {
  const [sigil, setSigil] = useState(null);
  const [value, setValue] = useState(0);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState<any>(true)
  const [model, setModel] = useState<any>(null)
  const [images, setImages] = useState([])


  useEffect(() => {
    if(sigil){
      db = new BrowserLevel(sigil, { valueEncoding: 'json' })
    }
  },[sigil])
  const handleMetaMaskConnect = async () => {
    
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        // @ts-ignore
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        console.log('Connected account:', accounts[0]);

        const provider = new ethers.JsonRpcProvider(
          "https://nodes.sequence.app/mainnet"
        );
        
        // Azimuth contract address (this might need to be confirmed)
        const azimuthContractAddress = '0x223c067f8cf28ae173ee5cafea60ca44c335fecb';
        
        // ABI for the Azimuth contract (simplified for ownership query)
        const azimuthAbi = [
          'function getOwner(uint32 point) view returns (address)',
          'function getOwnedPoints(address owner) view returns (uint32[])',
        ];
        
        // Create a contract instance
        const azimuthContract = new ethers.Contract(azimuthContractAddress, azimuthAbi, provider);

        function pointToPatp(point: any) {
          return ob.patp(point);
        }

        const urbitIds = await azimuthContract.getOwnedPoints(accounts[0]);

        if(urbitIds != ''){
          console.log(`Urbit IDs associated with ${urbitIds}:`);

          const urbitId = pointToPatp(Number(urbitIds));

          console.log(`Urbit ID for point ${urbitIds}: ${urbitId}`);

          setSigil(urbitId)
          // setSelectedTab("workout");
        }else {
          alert('No Urbit ID associated with this address')

        }

        // Here you would handle the connection with your Urbit authentication
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  const handleChange = (_: any, newValue: number) => {
    console.log(newValue)
    setValue(newValue);
  };

const [cols, setCols] = useState<any>([])
const [pics, setPics] = useState<any>([])
const [metadataText, setMetadataText] = useState<any>(null)

  useEffect(( )=> {
    setTimeout(async () => {

      if(sigil){

    const entries = await db.iterator().all()
    setPics(entries.map((image: any) => {
      return <div style={{width: '280px', height: '280px', border: '1px solid lightgrey', margin: '20px', padding:'0px'}}>
      <img style={{objectFit: 'cover', padding: '0px', maxWidth: '280px', maxHeight: '280px'}} src={image[1].image} />
    </div>
  }))
      }

    }, 0)

  }, [images, value])

  useEffect(() => {
    setTimeout(async () => {

    if(localStorage.getItem('tensorflowjs_models/my-model-1/info')){

      const loadedModel = await tf.loadLayersModel('localstorage://my-model-1');

      // const saveResults = await model.save('localstorage://my-model-1');
      setModel(loadedModel)
      setLoading(false)
    } else {
        console.log('fitting model')
        setLoading(true)

        const model = tf.sequential()

        model.add(tf.layers.embedding({inputDim: vocab_size, outputDim: embedding_size, inputLength: (2* window_size +1) }))
        model.add(tf.layers.flatten())
        // @ts-ignore
        model.add(tf.layers.dense({units: targets[0].length, activation: 'softmax'}))

        // # Compile the model
        model.compile({optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy']});
        await model.fit(X, y, {epochs: 100})
        await model.save('localstorage://my-model-1')
        setLoading(false)

      }
    }, 0)

  }, [model, loading])

  useEffect(( )=> {

  }, [pics])

  const changeMetadataText = (evt: any) => {
    console.log(evt.target.value)
    setMetadataText(evt.target.value)
  }

  const saveFileAndMetadata = async () => {
    console.log(metadataText)
    console.log(image)
    const entries = await db.iterator().all()
    console.log(entries)
    const loadedModel = model

    let idsOne: any = metadataText.split(' ').map((word: any, i: any) => {
      if(dict[word] && i < 5){
        return dict[word]
      } else if(i < 5){
        return null
      }
    })

    console.log(idsOne)

    idsOne = idsOne.filter(function( element: any ) {
       return element !== undefined;
    });

    if(idsOne.length <= 5){
      for(let i = 0; idsOne.length < 5; i++){
        idsOne.push(null)
      }
    }

    console.log(idsOne)
    const input = tf.tensor2d(idsOne, [1, 5])

    db.put(entries.length, {
      image: image,
      metadata: metadataText,
      vector: Array.from(loadedModel.predict(input).dataSync())
    })
  }

  const [searchedPics, setSearchedPics] = useState<any>([])

  useEffect(() => {

    setSearchedPics(images.map((image: any) => {
      console.log(image)
      return <div style={{width: '280px', height: '280px', border: '1px solid lightgrey', margin: '20px', padding:'0px'}}>
      <img style={{objectFit: 'cover', padding: '0px', maxWidth: '280px', maxHeight: '280px'}} src={image.image[1].image} />
    </div>
  }))
  }, [images])

  return (
    <>
      {!sigil 
        ? 
        <button onClick={handleMetaMaskConnect}>
        L1 Urbit sign-in
      </button>
      :
      loading ? 
        <>
          loading...
        </>
        :
    <>
      <br/>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
      <Tabs value={value} onChange={handleChange} aria-label="disabled tabs example">
        <Tab label="U p l o a d" style={{outline: 'none', fontFamily: 'Avenir'}}>
        </Tab>
        <Tab label="B r o w s e" style={{outline: 'none', fontFamily: 'Avenir'}}>
        </Tab>
        <Tab label="S e a r c h" style={{outline: 'none', fontFamily: 'Avenir'}}>
        </Tab>
      </Tabs>
      </Box>
      <br/>
      <br/>

      {
        value ==2 ? 
        <>
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Search setImages={setImages} model={model} cols={cols} setCols={setCols}/>
      </Box>

        <br/>
        <br/>
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div className="container">
        {searchedPics}
        </div>
      </Box>
</>
        :

        value == 0 ?
        <>
          <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Grid container spacing={1} columns={12}>
          <Grid
            size={12}
            style={{
            }}
          >
          <textarea onChange={changeMetadataText} placeholder="metadata / filename" style={{width: '400px', height: '60px'}}/>
          </Grid>
          <br/>
          <Grid
            size={12}
            style={{
              display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
              padding: 'auto'
            }}
          >
        <DragDrop setImage={setImage}/>

          </Grid>
          <br/>
          <Grid
            size={12}
            style={{
              display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
              padding: 'auto'
            }}
          >
          <button onClick={saveFileAndMetadata}>
            save
          </button>
          </Grid>
        </Grid>

        <br/>
      </Box>

        </>:<>
          
<Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div className="container">
        {pics}
        </div>
      </Box>
        </>
      }
      

      
    </>
    }

    </>

  )
}

export default App
