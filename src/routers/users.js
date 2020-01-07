const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellation} = require('../email/account')
// create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()        
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })

    } catch (error) {
        res.status(400).send(error)                
    }
}) 


// login user
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user: user, token })
    } catch (error) {
        res.status(400).send()
    }
})

// logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()        
    } catch (error) {
        res.status(500).send()
    }
})

// logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()        
    } catch (error) {
        res.status(500).send()
    }
})


// get all the users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// find by user id   No longer needed
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.status(200).send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

// delete a user
router.delete('/users/me', auth, async (req, res) => { 
    try {
        await req.user.remove()
        sendCancellation(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        console.log(error);
        return res.status(500).send()
    }
})


// update a user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send( {error: 'Invalid updates'})
    }

    try {
        const user = req.user
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()
        res.send(user)

    } catch (error) {
        return res.status(400).send()
    }
})

// upload an avatar 
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a JPG/JPEG/PNG image.'))            
        }        
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize( {width: 250, height: 250} ).png().toBuffer()
    req.user.avatar = buffer    
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message })
})

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => { 
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        return res.status(500).send()
    }
})

// fetch avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id) 
        if (!user || !user.avatar) {
            throw new Error('No user OR no user avatar')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router
